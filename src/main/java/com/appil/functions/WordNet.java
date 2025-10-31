package com.appil.functions;

import net.sf.extjwnl.JWNLException;
import net.sf.extjwnl.data.IndexWord;
import net.sf.extjwnl.data.POS;
import net.sf.extjwnl.data.PointerType;
import net.sf.extjwnl.data.PointerUtils;
import net.sf.extjwnl.data.Synset;
import net.sf.extjwnl.data.list.PointerTargetNode;
import net.sf.extjwnl.data.list.PointerTargetNodeList;
import net.sf.extjwnl.data.list.PointerTargetTree;
import net.sf.extjwnl.data.relationship.AsymmetricRelationship;
import net.sf.extjwnl.data.relationship.Relationship;
import net.sf.extjwnl.data.relationship.RelationshipFinder;
import net.sf.extjwnl.data.relationship.RelationshipList;
import net.sf.extjwnl.dictionary.Dictionary;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.json.*;


import com.google.gson.Gson;
import com.google.gson.JsonArray;

import edu.mit.jwi.item.Word;

import static guru.nidi.graphviz.model.Factory.*;

import guru.nidi.graphviz.attribute.Color;
import guru.nidi.graphviz.attribute.Font;
import guru.nidi.graphviz.attribute.Image;
import guru.nidi.graphviz.attribute.Label;
import guru.nidi.graphviz.attribute.Rank;
import guru.nidi.graphviz.attribute.Rank.RankDir;
import guru.nidi.graphviz.engine.Format;
import guru.nidi.graphviz.engine.Graphviz;
import guru.nidi.graphviz.model.Factory;
import guru.nidi.graphviz.model.Graph;
import guru.nidi.graphviz.model.MutableAttributed;
import guru.nidi.graphviz.model.MutableGraph;
import guru.nidi.graphviz.model.MutableNode;
import guru.nidi.graphviz.*;




public class WordNet {
	
	public Dictionary dictionary;
	public static final HashMap<String, Integer> mapTags;
	
	public HashMap<String, List<String>> lexical = new HashMap<String, List<String>>();
	public List<String> synonyms = new ArrayList<String>();
	public List<String> hypernyms = new ArrayList<String>();
	public List<String> meronyms = new ArrayList<String>();
	public List<String> hyponyms = new ArrayList<String>();
	public List<String> antonyms = new ArrayList<String>();
	
	static { mapTags = new HashMap<>();
	
    mapTags.put("JJ", 3);   mapTags.put("JJR", 3);  mapTags.put("JJS", 3);
    mapTags.put("V", 2);  mapTags.put("VBZ", 2);  mapTags.put("VBN", 2);  mapTags.put("VB", 2);  mapTags.put("VBD", 2);  mapTags.put("VBP", 2);
    mapTags.put("N", 1);  mapTags.put("NNS", 1);  mapTags.put("NNP", 1);  mapTags.put("NNPS", 1); mapTags.put("NN", 1); 
    mapTags.put("RB", 4); mapTags.put("RBR", 4); mapTags.put("RBS",4); }
	
	
	public WordNet() throws JWNLException {
		
				
		this.dictionary = Dictionary.getDefaultResourceInstance();
		
	}
	

	
	public HashMap<Integer, HashMap<String, List<String>>> search(String lemma, String tag) throws JWNLException {
		
		HashMap<Integer, HashMap<String, List<String>>> lexRel = new HashMap<Integer, HashMap<String, List<String>>>();	
					
		if (mapTags.get(tag) == 1) {
			
			Dictionary dictionary = Dictionary.getDefaultResourceInstance();				
			
			int key = mapTags.get(tag); 
			IndexWord index = dictionary.lookupIndexWord(POS.getPOSForId(key), lemma);      	
			
			List<Synset> senses = index.getSenses();	
			
			int i = 0;
			
			for (Synset s : senses) {
						
				
				HashMap<String, List<String>> lexical = new HashMap<String, List<String>>();
				List <String> synonymss = new ArrayList<String>();
				List <String> hyponymss = new ArrayList<String>();
				List <String> hypernymss = new ArrayList<String>();
				List <String> meronymss = new ArrayList<String>();
				List <String> antonymss = new ArrayList<String>();
				List <String> glosses = new ArrayList<String>();
				
					glosses.add(s.getGloss());				
				
											
						for (net.sf.extjwnl.data.Word sy : s.getWords()) {
									
									synonymss.add(sy.getLemma());				
											
						}
						
						for (PointerTargetNode hypernyms : PointerUtils.getDirectHypernyms(s)) {
							
							for (net.sf.extjwnl.data.Word hyper : hypernyms.getSynset().getWords()) {
								
										hypernymss.add(hyper.getLemma());				
							}
						}
							
							for (PointerTargetNode hyponyms : PointerUtils.getDirectHyponyms(s)) {
								
								for (net.sf.extjwnl.data.Word hyponym: hyponyms.getSynset().getWords()) {
									
											hyponymss.add(hyponym.getLemma());				
								}
							}
								
								for (PointerTargetNode meronyms : PointerUtils.getPartMeronyms(s)) {
									
									for (net.sf.extjwnl.data.Word meronym : meronyms.getSynset().getWords()) {
										
												meronymss.add(meronym.getLemma());				
									}
				
								}
								
								for (PointerTargetNode antonyms : PointerUtils.getAntonyms(s)) {
									
									for (net.sf.extjwnl.data.Word antonym : antonyms.getSynset().getWords()) {
										
												antonymss.add(antonym.getLemma());				
									}
				
								}
				
							
					lexical.put("synonyms", synonymss);
					lexical.put("hypernyms", hypernymss);
					lexical.put("hyponyms", hyponymss);
					lexical.put("meronyms", meronymss);
					lexical.put("antonyms", antonymss);	
					lexical.put("gloss", glosses);
					
					
					lexRel.put(i, lexical);	
					
					i++;		
							
			}
		}		
		
		return lexRel;
		
		
	}


//	public static  String searchToJSON(String lemma, String tag) throws FileNotFoundException, IOException, JWNLException {
//		
//		Map<String, Object> graphData = new HashMap<>();
//		
//		List<String> id = new ArrayList<String>();
//		List<String> labels = new ArrayList<String>();
//		List<String> POS = new ArrayList<String>();
//		List<String> images = new ArrayList<String>();
//				
//		List<String> relation = new ArrayList<String>();
//		List<String> source = new ArrayList<String>();
//		List<String> target = new ArrayList<String>();		
//
//		WordNet wn = new WordNet();
//		HashMap<Integer, HashMap<String, List<String>>> rel = wn.search(lemma, tag);
//		
//		String image = Sparql.search(lemma, "").get("img");
//		
//		id.add(lemma);
//		labels.add(lemma);
//		POS.add(tag);
//		images.add(image);
//		
//		for (int i = 0; i < rel.size(); i++) {
//			
//			String gloss = rel.get(i).get("gloss").get(0);
//			id.add("Sense"+i);
//			labels.add(gloss);
//			POS.add(tag);
//			images.add("https://upload.wikimedia.org/wikipedia/commons/5/52/Blue_translucent_circle_highlighter.png");
//			
//			source.add("Sense" + i);
//			target.add(lemma);
//			relation.add("Sense");
//			
//									
//			HashMap<String, List<String>> relations = rel.get(i);	
//										
//				List<String> synonyms = relations.get("synonyms");
//				
//					for (String s : synonyms) {
//						
//						labels.add(s);
//						id.add(s+i);
//						POS.add("N");
//						
//						String img = Sparql.search(s, "").get("img");
//						
//						if (img != null)						
//						images.add(img);
//						else
//						images.add("https://upload.wikimedia.org/wikipedia/commons/5/52/Blue_translucent_circle_highlighter.png");
//						
//						source.add(s+i);
//						target.add("Sense" + i);
//						relation.add("synonym"); 						
//						
//					 }
//				
//				List<String> hypernyms = relations.get("hypernyms");
//				
//				for (String h: hypernyms) {
//					
//					
//				}
//				
//				List<String> hyponyms = relations.get("hyponyms");
//				
//				for (String h : hyponyms) {
//					
//					
//				}
//				
//				List<String> meronyms = relations.get("meronyms");
//				
//				for (String m : meronyms) {
//					
//					
//				}
//				
//				List<String> antonyms = relations.get("antonyms");
//				
//				for (String a : antonyms) {
//					
//					
//				}			
//			
//		}
//		
//				
//		Graphs graph = new Graphs();
//        graphData.put("nodes", graph.createNodes(id, labels, POS, images));
//        graphData.put("links", graph.createLinks(source, target, "hello"));
//
//        // Utilizzo di Gson per convertire la HashMap in una stringa JSON formattata
//        Gson gson = new Gson();
//        String json = gson.toJson(graphData);
//		System.out.println(json);
//		
//		return json;
//				
//	}    
//		
	
	public static String DOTgen (String lemma, String tag) throws JWNLException {
			
		
		MutableGraph graph = Factory.mutGraph("exampleGraph").setDirected(true).setName("Relations");
		//graph.graphAttrs().add("rankdir", RankDir.LEFT_TO_RIGHT);
		graph.graphAttrs().add("layout", "circo");
		graph.linkAttrs().add("color", "SkyBlue");	
		graph.nodeAttrs().add("fillcolor", "AliceBlue");
		graph.nodeAttrs().add("shape", "note");
		graph.nodeAttrs().add("color", "Yellow");
		graph.linkAttrs().add("weight", 0.5);
			

		MutableNode main = Factory.mutNode(lemma).add(Label.of(lemma.toUpperCase())).add("fontsize", "40").add("style", "bold").add("shape", "circle");
		main.add("img", Sparql.search(lemma, "").get("image"));
		main.addTo(graph);
		
		
		if (mapTags.get(tag) == 1) {
			
			Dictionary dictionary = Dictionary.getDefaultResourceInstance();				
			
			int key = mapTags.get(tag); 
			IndexWord index = dictionary.lookupIndexWord(POS.getPOSForId(key), lemma);      	
			
			WordNet wn = new WordNet();
			HashMap<Integer, HashMap<String, List<String>>> rel = wn.search(lemma, tag);
			System.out.println(rel.get(0).get("gloss").get(0));
			
			for (int i = 0; i < rel.size(); i++) {
				
				MutableNode sense = Factory.mutNode("sense"+i).add(Label.of(rel.get(i).get("gloss").get(0)));	
				graph.add(main.addLink(sense));								
				
				List<String> synonyms = rel.get(i).get("synonyms");
				if(!synonyms.isEmpty()) {
				MutableNode syns = Factory.mutNode("synonyms"+i).add(Label.of("synonyms"));						
	            syns.addTo(graph);
	            graph.add(sense.addLink(syns));
				
					for(String synonym : synonyms) {					
						
						MutableNode currentNode = Factory.mutNode(synonym+i).add(Label.of(synonym)).add("URL", Sparql.search(lemma, "").get("word"));						
			            currentNode.addTo(graph);
			            graph.add(syns.addLink(currentNode));
			           
					}
				}
				
					List<String> meronyms = rel.get(i).get("meronyms");
					
					
					if (!meronyms.isEmpty()) {
						
					MutableNode mers = Factory.mutNode("meronyms"+i).add(Label.of("meronyms"));						
		            mers.addTo(graph);
		            graph.add(sense.addLink(mers));
					
						for(String meronym : meronyms) {			
														
							MutableNode currentNode = Factory.mutNode(meronym+i).add(Label.of(meronym));						
				            currentNode.addTo(graph);
				            graph.add(mers.addLink(currentNode));
				           
						}
					}	
					
						List<String> antonyms = rel.get(i).get("antonyms");
						if(antonyms.size() > 0) {
							
							System.out.println("-----------------------");
							System.out.println(antonyms.size());
							System.out.println(antonyms.isEmpty());
							System.out.println("-----------------------");
						
						MutableNode ants = Factory.mutNode("antonyms"+i).add(Label.of("antonyms"));						
			            ants.addTo(graph);
			            graph.add(sense.addLink(ants));
						
							for(String antonym : antonyms) {			
															
								MutableNode currentNode = Factory.mutNode(antonym+i).add(Label.of(antonym));						
					            currentNode.addTo(graph);
					            graph.add(ants.addLink(currentNode));
					           
							}
						}	
							
							List<String> hypernyms = rel.get(i).get("hypernyms");
							
							if(!hypernyms.isEmpty()) {
							MutableNode hyps = Factory.mutNode("hypernyms"+i).add(Label.of("hypernyms"));						
				            hyps.addTo(graph);
				            graph.add(sense.addLink(hyps));
							
								for(String hypernym : hypernyms) {			
																
									MutableNode currentNode = Factory.mutNode(hypernym+i).add(Label.of(hypernym));						
						            currentNode.addTo(graph);
						            graph.add(hyps.addLink(currentNode));
						           
								}
								
							}
							
								List<String> hyponyms = rel.get(i).get("hyponyms");
								
								if (!hyponyms.isEmpty()) {
								
								MutableNode hypo = Factory.mutNode("hyponyms"+i).add(Label.of("hyponyms"));						
					            hypo.addTo(graph);
					            graph.add(sense.addLink(hypo));
								
									for(String hyponym : hyponyms) {			
																	
										MutableNode currentNode = Factory.mutNode(hyponym+i).add(Label.of(hyponym));						
							            currentNode.addTo(graph);
							            graph.add(hypo.addLink(currentNode));
							           
									}
								
								}
						
				
				
			}
			
			
			
		}
		
		
		
		
		return graph.toString();
		
		
	}
	
	
	
//	public static String JSONgen (String word, String partOfSpeech) throws JWNLException {
//
//	    // Initialize WordNet
//	    WordNet wordNet = new WordNet();
//	    // Search WordNet for the given word and part of speech
//	    HashMap<Integer, HashMap<String, List<String>>> results = wordNet.search(word, partOfSpeech);
//
//	    // Create JSON arrays for words and links
//	    JSONArray wordsArray = new JSONArray();
//	    JSONArray linksArray = new JSONArray();
//
//	    // Add the main word node
//	    wordsArray.put(createNode(word.replaceAll(" ", "_") + "main", word));
//
//	    // Iterate through the results
//	    for (int i = 0; i < results.size(); i++) {
//	        HashMap<String, List<String>> relations = results.get(i);
//
//	        // Add the main definition node
//	        wordsArray.put(createNode("definition" + i, relations.get("gloss").get(0)));
//	        linksArray.put(createLink("definition" + i, word.replaceAll(" ", "_") + "main", "related"));
//
//	        // Process each type of relationship
//	        processRelations("similarWords", i, relations.get("synonyms"), wordsArray, linksArray);
//	        processRelations("broaderTerms", i, relations.get("hypernyms"), wordsArray, linksArray);
//	        processRelations("narrowerTerms", i, relations.get("hyponyms"), wordsArray, linksArray);
//	        processRelations("partsOf", i, relations.get("meronyms"), wordsArray, linksArray);
//	        processRelations("opposites", i, relations.get("antonyms"), wordsArray, linksArray);
//	    }
//
//	    // Convert the arrays to JSON strings and return the combined result
//	    JSONObject result = new JSONObject();
//	    result.put("words", wordsArray);
//	    result.put("links", linksArray);
//	    
//	    System.out.println(result);
//
//	    return result.toString();
//	}

//	private static void processRelations(String relationType, int index, List<String> words, JSONArray wordsArray, JSONArray linksArray) {
//	    wordsArray.put(createNode(relationType + index, relationType));
//	    linksArray.put(createLink(relationType + index, "definition" + index, "related"));
//
//	    for (String word : words) {
//	        wordsArray.put(createNode(word.replaceAll(" ", "_") + index, word));
//	        linksArray.put(createLink(relationType + index, word.replaceAll(" ", "_") + index, "related"));
//	    }
//	}
//
//
//	private static JSONObject createNode(String id, String label) {
//	    JSONObject node = new JSONObject();
//	    node.put("id", id);
//	    node.put("label", label);
//	    return node;
//	}
//	
//	// Metodo per creare un oggetto JSON rappresentante un link
//	private static JSONObject createLink(String source, String target, String type) {
//	    JSONObject link = new JSONObject();
//	    link.put("source", source);
//	    link.put("target", target);
//	    link.put("type", type);
//	    return link;
//	}
//	
	
	
	public static String JSONGen(String word, String partOfSpeech) throws JWNLException {

	    // Initialize WordNet
	    WordNet wordNet = new WordNet();
	    // Search WordNet for the given word and part of speech
	    HashMap<Integer, HashMap<String, List<String>>> results = wordNet.search(word, partOfSpeech);

	    // Create JSON arrays for words and links
	    JSONArray wordsArray = new JSONArray();
	    JSONArray linksArray = new JSONArray();

	    // Add the main word node
	    wordsArray.put(createNode(word.replaceAll(" ", "_") + "main", word));

	    // Iterate through the results
	    for (int i = 0; i < results.size(); i++) {
	    	
	        HashMap<String, List<String>> relations = results.get(i);

	        // Add the main definition node
	        wordsArray.put(createNode("definition" + i, relations.get("gloss").get(0)));
	        linksArray.put(createLink("definition" + i, word.replaceAll(" ", "_") + "main", "definition"));

	        // Process each type of relationship
	        processRelations("similarWords", "synonyms", i, relations.get("synonyms"), wordsArray, linksArray);
	        processRelations("broaderTerms", "hypernyms", i, relations.get("hypernyms"), wordsArray, linksArray);
	        processRelations("narrowerTerms", "hyponyms", i, relations.get("hyponyms"), wordsArray, linksArray);
	        processRelations("partsOf", "meronyms", i, relations.get("meronyms"), wordsArray, linksArray);
	        processRelations("opposites", "antonyms", i, relations.get("antonyms"), wordsArray, linksArray);
	    }

	    // Convert the arrays to JSON strings and return the combined result
	    JSONObject result = new JSONObject();
	    result.put("words", wordsArray);
	    result.put("links", linksArray);
	    
	    
	    return result.toString();
	}

	private static void processRelations(String label, String relationType, int index, List<String> words, JSONArray wordsArray, JSONArray linksArray) {
	    wordsArray.put(createNode(label + index, label));
	    linksArray.put(createLink(label + index, "definition" + index, relationType));

	    for (String word : words) {
	        wordsArray.put(createNode(word.replaceAll(" ", "_") + index, word));
	        linksArray.put(createLink(label + index, word.replaceAll(" ", "_") + index, relationType));
	    }
	}

	private static JSONObject createNode(String id, String label) {
	    JSONObject node = new JSONObject();
	    node.put("id", id);
	    node.put("label", label);
	    return node;
	}

	private static JSONObject createLink(String source, String target, String relation) {
	    JSONObject link = new JSONObject();
	    link.put("source", source);
	    link.put("target", target);
	    link.put("relation", relation);
	    return link;
	}
	
	public String definition(String word, String tag) throws JWNLException {
		
		int key = mapTags.get(tag); 
		IndexWord index = dictionary.lookupIndexWord(POS.getPOSForId(key), word);      	
		
		List<Synset> senses = index.getSenses();	
		
		int i = 0;
		String definitions = "";
		
		for (Synset s : senses) {
			
			definitions = definitions + "("+i+"): " + s.getGloss() + "<br>";	
			
			i++;
		}
		
		return "<div id='definitions'>" + definitions + "<p> Definitions from <a id=\"attribution\" target=\"_blank\" href=\"https://wordnet.princeton.edu/license-and-commercial-use\">Princeton WordNet 3.0</a></div>";			
		
	}
	
	
	
	public String getAllSynsets(String lemma, String tag) throws JWNLException {
		
        int posKey = mapTags.get(tag);
        POS pos = POS.getPOSForId(posKey);
        IndexWord indexWord = dictionary.lookupIndexWord(pos, lemma);
        
        if (indexWord == null) {
            return "No synsets found for the given word and POS tag.";
        }
        
        List<Synset> senses = indexWord.getSenses();
        StringBuilder result = new StringBuilder();
        
        for (Synset synset : senses) {
        	
        	System.out.println(synset.getKey());
            
            result.append("Gloss: ").append(synset.getGloss()).append("\n");
            result.append("Words: ");
            
            for (net.sf.extjwnl.data.Word word : synset.getWords()) {
                result.append(word.getLemma()).append(" ");
            }
            result.append("\n");
            
            result.append("Hypernyms: ");
            for (PointerTargetNode node : PointerUtils.getDirectHypernyms(synset)) {
                for (net.sf.extjwnl.data.Word word : node.getSynset().getWords()) {
                    result.append(word.getLemma()).append(" ");
                }
            }
            result.append("\n");
            
            result.append("Hyponyms: ");
            for (PointerTargetNode node : PointerUtils.getDirectHyponyms(synset)) {
                for (net.sf.extjwnl.data.Word word : node.getSynset().getWords()) {
                    result.append(word.getLemma()).append(" ");
                }
            }
            result.append("\n");
            
            result.append("Meronyms: ");
            for (PointerTargetNode node : PointerUtils.getPartMeronyms(synset)) {
                for (net.sf.extjwnl.data.Word word : node.getSynset().getWords()) {
                    result.append(word.getLemma()).append(" ");
                }
            }
            result.append("\n");
            
            result.append("Antonyms: ");
            for (PointerTargetNode node : PointerUtils.getAntonyms(synset)) {
                for (net.sf.extjwnl.data.Word word : node.getSynset().getWords()) {
                    result.append(word.getLemma()).append(" ");
                }
            }
            result.append("\n\n");
            break;
        }
        
        return result.toString();
    }
	
	
	
}
