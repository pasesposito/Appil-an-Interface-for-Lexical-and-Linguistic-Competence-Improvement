package com.appil.dto;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

import com.appil.service.LevelService;
import com.appil.service.NounEnhancementService;
import com.appil.service.SparqlService;
import com.appil.service.WordService;
import com.google.gson.JsonObject;

public class WordDTO {

    private String form;
    private String lemma;
    private String tag;
    private String image;
    private String link;
    private String abs;
    private String easier;
    private Long idNoun;
    private String labelIt;
    private WordImageDTO imageInfo;
    private boolean entity;
    private EntityType entityType; 
    private int level;
    private boolean toEnhance;
    private boolean punctuation;
    private List<String> synonyms = new ArrayList<>();
    private List<String> hypernyms = new ArrayList<>();
    private List<String> hyponyms = new ArrayList<>();
    private List<String> meronyms = new ArrayList<>();
    private List<String> holonyms = new ArrayList<>();
    private List<String> antonyms = new ArrayList<>();
    private String definition;
    private HashMap<String, Integer> leveledSynonyms;
    private String wikiPage;
    private String relationGraph;
    
 // Metric fields
    private double stemDiff; // Stem difference metric
    private double levenshteinDistance; // Levenshtein distance metric
    private float combinedScore; // Combined score metric

    public static HashMap<String, Integer> mapTags;
    static {
        mapTags = new HashMap<>();
        mapTags.put("JJ", 3);
        mapTags.put("JJR", 3);
        mapTags.put("JJS", 3);
        mapTags.put("V", 2);
        mapTags.put("VBZ", 2);
        mapTags.put("VBN", 2);
        mapTags.put("VB", 2);
        mapTags.put("VBD", 2);
        mapTags.put("VBP", 2);
        mapTags.put("N", 1);
        mapTags.put("NNS", 1);
        mapTags.put("NNP", 1);
        mapTags.put("NNPS", 1);
        mapTags.put("NN", 1);
        mapTags.put("RB", 4);
        mapTags.put("RBR", 4);
        mapTags.put("RBS", 4);
    }

    // Updated constructor with EntityType
    public WordDTO(String form, String lemma, String tag, String image, String link, String abs,
                   String easier, Long idNoun, WordImageDTO imageInfo, boolean entity, EntityType entityType,
                   int level, boolean toEnhance, boolean punctuation, List<String> synonyms, List<String> hypernyms,
                   List<String> hyponyms, List<String> meronyms, List<String> holonyms, List<String> antonyms,
                   String definition, HashMap<String, Integer> leveledSynonyms, String wikiPage,
                   String relationGraph) {
        this.form = form;
        this.lemma = lemma;
        this.tag = tag;
        this.image = image;
        this.link = link;
        this.abs = abs;
        this.easier = easier;
        this.idNoun = idNoun;
        this.imageInfo = imageInfo;
        this.entity = entity;
        this.entityType = entityType;
        this.level = level;
        this.toEnhance = toEnhance;
        this.punctuation = punctuation;
        this.synonyms = synonyms != null ? synonyms : new ArrayList<>();
        this.hypernyms = hypernyms != null ? hypernyms : new ArrayList<>();
        this.hyponyms = hyponyms != null ? hyponyms : new ArrayList<>();
        this.meronyms = meronyms != null ? meronyms : new ArrayList<>();
        this.holonyms = holonyms != null ? holonyms : new ArrayList<>();
        this.antonyms = antonyms != null ? antonyms : new ArrayList<>();
        this.definition = definition != null ? definition : "Definition not available";
        this.leveledSynonyms = leveledSynonyms != null ? leveledSynonyms : new HashMap<>();
        this.wikiPage = wikiPage;
        this.relationGraph = relationGraph;
    }

    public WordDTO(String token, boolean b) {
        this.punctuation = b;
        this.form = token;
    }

    public WordDTO(String token, String tag, String lemma, boolean isEntity, EntityType entityType, String sentence, int sessionLevel,
                   LevelService levelService, NounEnhancementService nounEnhancementService, SparqlService sparqlService, WordService wordService) throws IOException {
        this.form = token;
        this.entity = isEntity;
        this.entityType = entityType;
        this.lemma = lemma;
        this.tag = tag;

        Integer levelNumber = levelService.getLevelNumberByWord(lemma);

        if (mapTags.get(tag) != null && (levelNumber >= sessionLevel || levelNumber == 11 || levelNumber >= 4) && !isEntity) {
            
        	this.toEnhance = true;
            this.level = levelNumber;

            if (mapTags.get(tag) == 1) {
                wordService.enhanceNoun(sentence, this, nounEnhancementService, sparqlService);
            } else if (mapTags.get(tag) == 2) {
                // Enhance verbs if needed
            }
        }
    }

  

    // Getters and Setters
    public String getForm() {
        return form;
    }

    public void setForm(String form) {
        this.form = form;
    }

    public String getLemma() {
        return lemma;
    }

    public void setLemma(String lemma) {
        this.lemma = lemma;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public String getAbs() {
        return abs;
    }

    public void setAbs(String abs) {
        this.abs = abs;
    }

    public String getEasier() {
        return easier;
    }

    public void setEasier(String easier) {
        this.easier = easier;
    }

    public Long getIdNoun() {
        return idNoun;
    }

    public void setIdNoun(Long id) {
        this.idNoun = id;
    }

    public WordImageDTO getImageInfo() {
        return imageInfo;
    }

    public void setImageInfo(WordImageDTO imageInfo) {
        this.imageInfo = imageInfo;
    }

    public boolean isEntity() {
        return entity;
    }

    public void setEntity(boolean entity) {
        this.entity = entity;
    }

    public EntityType getEntityType() {
        return entityType;
    }

    public void setEntityType(EntityType entityType) {
        this.entityType = entityType;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public boolean isToEnhance() {
        return toEnhance;
    }

    public void setToEnhance(boolean toEnhance) {
        this.toEnhance = toEnhance;
    }

    public boolean isPunctuation() {
        return punctuation;
    }

    public void setPunctuation(boolean punctuation) {
        this.punctuation = punctuation;
    }

    public List<String> getSynonyms() {
        return synonyms;
    }

    public void setSynonyms(List<String> synonyms) {
        this.synonyms = synonyms;
    }

    public List<String> getHypernyms() {
        return hypernyms;
    }

    public void setHypernyms(List<String> hypernyms) {
        this.hypernyms = hypernyms;
    }

    public List<String> getHyponyms() {
        return hyponyms;
    }

    public void setHyponyms(List<String> hyponyms) {
        this.hyponyms = hyponyms;
    }

    public List<String> getMeronyms() {
        return meronyms;
    }

    public void setMeronyms(List<String> meronyms) {
        this.meronyms = meronyms;
    }

    public List<String> getHolonyms() {
        return holonyms;
    }

    public void setHolonyms(List<String> holonyms) {
        this.holonyms = holonyms;
    }

    public List<String> getAntonyms() {
        return antonyms;
    }

    public void setAntonyms(List<String> antonyms) {
        this.antonyms = antonyms;
    }

    public String getDefinition() {
        return definition;
    }

    public void setDefinition(String definition) {
        this.definition = definition;
    }

    public HashMap<String, Integer> getLeveledSynonyms() {
        return leveledSynonyms;
    }

    public void setLeveledSynonyms(HashMap<String, Integer> leveledSynonyms) {
        this.leveledSynonyms = leveledSynonyms;
    }

    public String getWikiPage() {
        return wikiPage;
    }

    public void setWikiPage(String wikiPage) {
        this.wikiPage = wikiPage;
    }

    public String getRelationGraph() {
        return relationGraph;
    }

    public void setRelationGraph(String relationGraph) {
        this.relationGraph = relationGraph;
    }
    
    public enum EntityType {
        PERSON,          // Person's name
        ORGANIZATION,    // Organization (company, institution, etc.)
        LOCATION,        // Geographical location (cities, countries, landmarks, etc.)
        DATE,            // Date (e.g., August 23, 2024)
        TIME,            // Time (e.g., 12:00 PM)
        MONEY,           // Monetary values (e.g., $100, 50 euros)
        PERCENT,         // Percentage (e.g., 25%)
        FACILITY,        // Buildings, airports, highways, etc.
        GPE,             // Geopolitical entities (countries, cities, states)
        ORG,             // Organization (alternative annotation for ORG)
        NORP,            // Nationalities, religious, or political groups
        EVENT,           // Events (e.g., World Cup, earthquake)
        LANGUAGE,        // Languages
        PRODUCT,         // Products (e.g., iPhone, car model)
        WORK_OF_ART,     // Works of art (e.g., The Mona Lisa)
        LAW,             // Laws or regulations (e.g., The Constitution)
        ORDINAL,         // Ordinal numbers (e.g., first, second)
        CARDINAL         // Cardinal numbers (e.g., one, two)
    }

	public double getStemDiff() {
		return stemDiff;
	}

	public void setStemDiff(double stemDiff) {
		this.stemDiff = stemDiff;
	}

	public double getLevenshteinDistance() {
		return levenshteinDistance;
	}

	public void setLevenshteinDistance(double levenshteinDistance) {
		this.levenshteinDistance = levenshteinDistance;
	}

	
	public float getCombinedScore() {
		return combinedScore;
	}

	public void setCombinedScore(Float combinedScore) {
		this.combinedScore = combinedScore;
	}

	public String getLabelIt() {
		return labelIt;
	}

	public void setLabelIt(String labelIt) {
		this.labelIt = labelIt;
	}

}
