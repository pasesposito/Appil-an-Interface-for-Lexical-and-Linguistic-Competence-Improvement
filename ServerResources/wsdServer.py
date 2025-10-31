from flask import Flask, request, jsonify
from pywsd.lesk import simple_lesk
import spacy
from nltk.tokenize import word_tokenize
from nltk import pos_tag, ne_chunk

# Initialize Flask app
app = Flask(__name__)

# Load the spaCy model
nlp = spacy.load("en_core_web_sm")

# Utility functions for Named Entity Recognition with spaCy
def extract_entities(text):
    doc = nlp(text)
    entities = [{'entity': ent.text, 'type': ent.label_} for ent in doc.ents]
    return entities

# Utility functions for word sense disambiguation
def get_synonyms(synset):
    return [lemma.name().replace('_', ' ') for lemma in synset.lemmas()]

def get_hypernyms(synset):
    return [hypernym.name().split('.')[0].replace('_', ' ') for hypernym in synset.hypernyms()]

def get_hyponyms(synset):
    return [hyponym.name().split('.')[0].replace('_', ' ') for hyponym in synset.hyponyms()]

def get_meronyms(synset):
    return [meronym.name().split('.')[0].replace('_', ' ') for meronym in synset.part_meronyms() + synset.substance_meronyms()]

def get_holonyms(synset):
    return [holonym.name().split('.')[0].replace('_', ' ') for holonym in synset.part_holonyms() + synset.substance_holonyms()]

def get_antonyms(synset):
    antonyms = set()
    for lemma in synset.lemmas():
        if lemma.antonyms():
            antonyms.add(lemma.antonyms()[0].name().replace('_', ' '))
    return list(antonyms)

def disambiguate(sentence, word):
    sense = simple_lesk(sentence, word)

    if sense:
        synonyms = get_synonyms(sense)
        hypernyms = get_hypernyms(sense)
        hyponyms = get_hyponyms(sense)
        meronyms = get_meronyms(sense)
        holonyms = get_holonyms(sense)
        antonyms = get_antonyms(sense)

        # Create words and links for the JSON
        words = [
            {"id": f"{word.replace(' ', '_')}_main", "label": word, "isCore": True},
            {"id": f"definition_0", "label": sense.definition(), "isCore": False}
        ]
        links = [
            {"source": f"{word.replace(' ', '_')}_main", "target": f"definition_0", "relation": "definition"}
        ]

        def add_relations(related_words, relation_type):
            relation_labels = {
                "synonym": "also known as",
                "hypernym": "is part of",
                "hyponym": "has a",
                "meronym": "is made of",
                "holonym": "contains",
                "antonym": "opposite"
            }
            for i, related_word in enumerate(related_words):
                related_word_id = f"{related_word.replace(' ', '_')}_related_{relation_type}_{i}"
                words.append({"id": related_word_id, "label": related_word, "isCore": False})
                relation_label = relation_labels.get(relation_type, relation_type.capitalize())
                links.append({"source": f"definition_0", "target": related_word_id, "relation": relation_label})

        add_relations(synonyms, "synonym")
        add_relations(hypernyms, "hypernym")
        add_relations(hyponyms, "hyponym")
        add_relations(meronyms, "meronym")
        add_relations(holonyms, "holonym")
        add_relations(antonyms, "antonym")

        return {
            'sense': sense.name(),
            'definition': sense.definition(),
            'examples': sense.examples(),
            'synonyms': synonyms,
            'hypernyms': hypernyms,
            'hyponyms': hyponyms,
            'meronyms': meronyms,
            'holonyms': holonyms,
            'antonyms': antonyms,
            'relation_graph': {
                'words': words,
                'links': links
            }
        }
    else:
        return {'error': 'No sense found'}

@app.route('/disambiguate', methods=['POST'])
def disambiguate_endpoint():
    data = request.json
    sentence = data.get('sentence')
    word = data.get('word')

    if not sentence or not word:
        return jsonify({'error': 'Sentence and word are required'}), 400

    result = disambiguate(sentence, word)
    return jsonify(result)

@app.route('/ner', methods=['POST'])
def ner_endpoint():
    data = request.json
    text = data.get('text')

    if not text:
        return jsonify({'error': 'Text is required'}), 400

    entities = extract_entities(text)
    return jsonify({'entities': entities})

if __name__ == "__main__":
    app.run(debug=True, host='localhost', port=5000)
