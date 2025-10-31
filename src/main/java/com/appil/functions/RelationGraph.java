package com.appil.functions;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import edu.stanford.nlp.ie.util.RelationTriple;
import edu.stanford.nlp.ling.CoreAnnotations;
import edu.stanford.nlp.naturalli.NaturalLogicAnnotations;
import edu.stanford.nlp.pipeline.Annotation;
import edu.stanford.nlp.pipeline.StanfordCoreNLP;
import edu.stanford.nlp.util.CoreMap;

import java.util.*;

public class RelationGraph {

    public static void main(String[] args) {
        String jsonRelations = relationsGraph("By the end of the third day I calculated that we were some thirty miles inland from the coast. Here we arrived at a waterfall and were forced to abandon the canoes.");

        // Print the obtained JSON
        System.out.println(jsonRelations);

        // You can send the JSON to your frontend for processing with D3.js
    }

    public static String relationsGraph(String text) {
        // Configure Stanford CoreNLP
        Properties props = new Properties();
        props.setProperty("annotators", "tokenize,ssplit,pos,lemma,depparse,natlog,openie");
        StanfordCoreNLP pipeline = new StanfordCoreNLP(props);

        // Create an Annotation object for the text
        Annotation document = new Annotation(text);

        // Perform the annotation
        pipeline.annotate(document);

        // Extract annotated sentences
        List<CoreMap> sentences = document.get(CoreAnnotations.SentencesAnnotation.class);
        //System.out.println(sentences);

        // Convert annotations to JSON
        return convertToJSON(sentences);
    }

    public static String convertToJSON(List<CoreMap> sentences) {
        Gson gson = new GsonBuilder().setPrettyPrinting().create();

        // Create a map to store unique relations
        Map<String, Map<String, Set<String>>> uniqueRelations = new HashMap<>();

        for (CoreMap sentence : sentences) {
            // Extract relation triples from the sentence
            Collection<RelationTriple> openieTriples = sentence.get(NaturalLogicAnnotations.RelationTriplesAnnotation.class);
            
           //System.out.println(openieTriples.toString());

            for (RelationTriple triple : openieTriples) {
                String subject = triple.subjectGloss();
                String relation = triple.relationGloss();
                String object = triple.objectGloss();

                // Composite key for unique subject-object pairs
                String key = subject + "->" + object;

                // Add the relation to the map, avoiding redundancy
                uniqueRelations.computeIfAbsent(key, k -> new HashMap<>())
                               .computeIfAbsent(relation, k -> new HashSet<>())
                               .add(relation);
            }
        }

        // Convert the map to a list of relation maps
        List<Map<String, Object>> relationList = new ArrayList<>();
        for (Map.Entry<String, Map<String, Set<String>>> entry : uniqueRelations.entrySet()) {
            String[] parts = entry.getKey().split("->");
            String subject = parts[0];
            String object = parts[1];

            for (Map.Entry<String, Set<String>> relEntry : entry.getValue().entrySet()) {
                Map<String, Object> relationMap = new HashMap<>();
                relationMap.put("subject", subject);
                relationMap.put("relation", relEntry.getKey());
                relationMap.put("object", object);
                relationList.add(relationMap);
            }
        }

        // Convert the data structure to JSON format
        return gson.toJson(relationList);
    }
}


//package appil;
//
//import com.google.gson.Gson;
//import com.google.gson.GsonBuilder;
//
//import edu.stanford.nlp.ie.util.RelationTriple;
//import edu.stanford.nlp.ling.CoreAnnotations;
//import edu.stanford.nlp.naturalli.NaturalLogicAnnotations;
//import edu.stanford.nlp.pipeline.Annotation;
//import edu.stanford.nlp.pipeline.StanfordCoreNLP;
//import edu.stanford.nlp.simple.*;
//import edu.stanford.nlp.util.CoreMap;
//
//import java.util.*;
//
//public class RelationGraph {
//
//    public static void main(String[] args) {
//        String jsonRelations = relationsGraph("By the end of the third day I calculated that we were some thirty miles inland from the coast. Here we arrived at a waterfall and were forced to abandon the canoes.");
//
//        // Stampa il JSON ottenuto
//        System.out.println(jsonRelations);
//
//        // Puoi inviare il JSON al tuo frontend per l'elaborazione con D3.js
//    }
//
//    public static String relationsGraph(String text) {
//        // Configurazione di Stanford CoreNLP
//        Properties props = new Properties();
//        props.setProperty("annotators", "tokenize,ssplit,pos,lemma,depparse,natlog,openie");
//        StanfordCoreNLP pipeline = new StanfordCoreNLP(props);
//
//        // Creazione di un oggetto Annotation per il testo
//        Annotation document = new Annotation(text);
//
//        // Esecuzione dell'annotazione
//        pipeline.annotate(document);
//
//        // Estrazione delle frasi annotate
//        List<CoreMap> sentences = document.get(CoreAnnotations.SentencesAnnotation.class);
//
//        // Converti le annotazioni in formato JSON
//        return convertToJSON(sentences);
//    }
//
//    public static String convertToJSON(List<CoreMap> sentences) {
//        Gson gson = new GsonBuilder().setPrettyPrinting().create();
//
//        // Creazione di una struttura dati per contenere le informazioni estratte
//        List<Map<String, Object>> relationList = new ArrayList<>();
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
//                Map<String, Object> relationMap = new HashMap<>();
//                relationMap.put("subject", subject);
//                relationMap.put("relation", relation);
//                relationMap.put("object", object);
//                relationList.add(relationMap);
//            }
//        }
//
//        // Converti la struttura dati in formato JSON
//        return gson.toJson(relationList);
//    }
//}
