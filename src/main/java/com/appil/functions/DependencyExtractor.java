package com.appil.functions;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import edu.stanford.nlp.ie.util.RelationTriple;
import edu.stanford.nlp.ling.CoreAnnotations;
import edu.stanford.nlp.naturalli.NaturalLogicAnnotations;
import edu.stanford.nlp.pipeline.Annotation;
import edu.stanford.nlp.pipeline.StanfordCoreNLP;
import edu.stanford.nlp.util.CoreMap;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.*;

public class DependencyExtractor {

	public static void main(String[] args) {
		String jsonRelations = relationsGraph("John Jeremy Thorpe was a British politician who served as the Member of Parliament for North Devon from 1959 to 1979, and as leader of the Liberal Party from 1967 to 1976. In May 1979 he was tried at the Old Bailey on charges of conspiracy and incitement to murder his ex-boyfriend Norman Scott, a former model. Thorpe was acquitted on all charges, but the case, and the furore surrounding it, ended his political career.");
		// Stampa il JSON ottenuto
		System.out.println(jsonRelations);

		// Puoi inviare il JSON al tuo frontend per l'elaborazione con D3.js
	}

	public static String relationsGraph(String text) {
	    // Configurazione di Stanford CoreNLP
	    Properties props = new Properties();
	    props.setProperty("annotators", "tokenize,ssplit,pos,lemma,depparse,natlog,openie");
	    StanfordCoreNLP pipeline = new StanfordCoreNLP(props);

	    // Creazione di un oggetto Annotation per il testo
	    Annotation document = new Annotation(text);

	    // Esecuzione dell'annotazione
	    pipeline.annotate(document);

	    // Estrazione delle frasi annotate 
	    List<CoreMap> sentences = document.get(CoreAnnotations.SentencesAnnotation.class);

	    // Converti le annotazioni in formato JSON con due array: nodes e links
	    String relations = convertToJSON(sentences);
	    
	   	  	    
	    String mergedRelations = null;
	    
	    // Send JSON data to Flask and get the merged result
		mergedRelations = sendJsonToFlask(relations);

	    // Return the merged results or the original JSON if the request fails
	    return (mergedRelations != null && !mergedRelations.trim().isEmpty()) ? mergedRelations : relations;
	}

	
	
	public static String sendJsonToFlask(String json) {
	    StringBuilder response = new StringBuilder();
	    try {
	        URL url = new URL("http://localhost:5005/merge_nodes"); // Adjust URL as needed
	        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
	        conn.setRequestMethod("POST");
	        conn.setRequestProperty("Content-Type", "application/json");
	        conn.setDoOutput(true);

	        // Send the JSON data
	        try (OutputStream os = conn.getOutputStream()) {
	            byte[] input = json.getBytes("utf-8");
	            os.write(input, 0, input.length);
	        }

	        // Read the response
	        int responseCode = conn.getResponseCode();
	        if (responseCode == HttpURLConnection.HTTP_OK) {
	            try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"))) {
	                String responseLine;
	                while ((responseLine = br.readLine()) != null) {
	                    response.append(responseLine.trim());
	                }
	            }
	        } else {
	            response.append("Request failed. Response code: ").append(responseCode);
	        }

	    } catch (MalformedURLException e) {
	        response.append("Malformed URL exception: ").append(e.getMessage());
	    } catch (IOException e) {
	        response.append("IO exception occurred: ").append(e.getMessage());
	    } catch (Exception e) {
	        response.append("Exception occurred: ").append(e.getMessage());
	    }

	    return response.toString();
	}

	
	

//    public static String convertToJSON(List<CoreMap> sentences) {
//        Gson gson = new GsonBuilder().setPrettyPrinting().create();
//
//        // Creazione di due strutture dati per contenere le informazioni estratte
//        List<Map<String, Object>> nodeList = new ArrayList<>();
//        List<Map<String, Object>> linkList = new ArrayList<>();
//
//        for (CoreMap sentence : sentences) {
//            // Estrai le triple di relazioni dalla frase
//            Collection<RelationTriple> openieTriples = sentence.get(NaturalLogicAnnotations.RelationTriplesAnnotation.class);
//
//            for (RelationTriple triple : openieTriples) {
//                String subject = triple.subjectGloss();
//                String relation = triple.relationGloss();
//                String object = triple.objectGloss();
//
//                // Aggiungi i nodi se non sono già presenti
//                addNode(nodeList, subject);
//                addNode(nodeList, object);
//
//                // Aggiungi il collegamento
//                Map<String, Object> linkMap = new HashMap<>();
//                linkMap.put("source", subject);
//                linkMap.put("target", object);
//                linkMap.put("relation", relation);
//                linkList.add(linkMap);
//            }
//        }
//
//        // Converti le strutture dati in formato JSON
//        Map<String, List<Map<String, Object>>> jsonMap = new HashMap<>();
//        jsonMap.put("nodes", nodeList);
//        jsonMap.put("links", linkList);
//
//        return gson.toJson(jsonMap);
//    }
//
//    private static void addNode(List<Map<String, Object>> nodeList, String nodeName) {
//        for (Map<String, Object> node : nodeList) {
//            if (node.get("id").equals(nodeName)) {
//                return; // Il nodo esiste già, non aggiungerlo di nuovo
//            }
//        }
//
//        // Aggiungi il nodo se non è già presente
//        Map<String, Object> nodeMap = new HashMap<>();
//        nodeMap.put("id", nodeName);
//        nodeList.add(nodeMap);
//    }

	public static String convertToJSON(List<CoreMap> sentences) {
		
		Gson gson = new GsonBuilder().setPrettyPrinting().create();

		// Creazione di due strutture dati per contenere le informazioni estratte
		List<Map<String, Object>> nodeList = new ArrayList<>();
		List<Map<String, Object>> linkList = new ArrayList<>();

		// Set the confidence threshold (adjust as needed)
		double confidenceThreshold = 0.95;

		for (CoreMap sentence : sentences) {
			// Estrai le triple di relazioni dalla frase
			Collection<RelationTriple> openieTriples = sentence
					.get(NaturalLogicAnnotations.RelationTriplesAnnotation.class);

			for (RelationTriple triple : openieTriples) {
				// Applica la soglia di confidenza
				if (triple.confidence >= confidenceThreshold) {
					String subject = triple.subjectGloss();
					String relation = triple.relationGloss();
					String object = triple.objectGloss();

					// Aggiungi i nodi se non sono già presenti
					addNode(nodeList, subject);
					addNode(nodeList, object);

					// Aggiungi il collegamento
					Map<String, Object> linkMap = new HashMap<>();
					linkMap.put("source", subject);
					linkMap.put("target", object);
					linkMap.put("relation", relation);
					linkList.add(linkMap);
				}
			}
		}

		// Converti le strutture dati in formato JSON
		Map<String, List<Map<String, Object>>> jsonMap = new HashMap<>();
		jsonMap.put("nodes", nodeList);
		jsonMap.put("links", linkList);
		
	
		return gson.toJson(jsonMap);
	}

	private static void addNode(List<Map<String, Object>> nodeList, String nodeName) {
		for (Map<String, Object> node : nodeList) {
			if (node.get("id").equals(nodeName)) {
				return; // Il nodo esiste già, non aggiungerlo di nuovo
			}
		}

		// Aggiungi il nodo se non è già presente
		Map<String, Object> nodeMap = new HashMap<>();
		nodeMap.put("id", nodeName);
		nodeList.add(nodeMap);
	}

}
