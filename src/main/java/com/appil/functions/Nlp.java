package com.appil.functions;

import edu.stanford.nlp.pipeline.*;
import edu.stanford.nlp.semgraph.SemanticGraph;
import edu.stanford.nlp.semgraph.SemanticGraphCoreAnnotations;
import edu.stanford.nlp.ling.*;
import edu.stanford.nlp.ling.CoreAnnotations.*;
import edu.stanford.nlp.util.*;
import opennlp.tools.postag.POSSample;
import edu.stanford.nlp.naturalli.NaturalLogicAnnotations;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.util.*;
import java.util.stream.Collectors;

public class Nlp {

    public static StanfordCoreNLP pipeline;

    static {
        Properties props = new Properties();
        props.setProperty("annotators", "tokenize,ssplit,pos,lemma,depparse,natlog,openie");
        pipeline = new StanfordCoreNLP(props);
    }

    public static String cleaner(String text) {
        return text.toLowerCase()
                   .replaceAll("\\p{Punct}", "")
                   .replaceAll("(  )+", " ")
                   .replaceAll("--", " ");
    }

    public static String[] tokenize(String text) {
        Annotation document = new Annotation(text);
        pipeline.annotate(document);
        List<CoreMap> sentences = document.get(SentencesAnnotation.class);

        return sentences.stream()
                        .flatMap(sentence -> sentence.get(TokensAnnotation.class).stream())
                        .map(CoreLabel::word)
                        .toArray(String[]::new);
    }

    public static String[] sentencedet(String text) {
        Annotation document = new Annotation(text);
        pipeline.annotate(document);
        List<CoreMap> sentences = document.get(SentencesAnnotation.class);
        return sentences.stream().map(CoreMap::toString).toArray(String[]::new);
    }

    public static String[] tagger(String[] tokens) {
        String text = String.join(" ", tokens);
        Annotation document = new Annotation(text);
        pipeline.annotate(document);
        List<CoreMap> sentences = document.get(SentencesAnnotation.class);

        return sentences.stream()
                        .flatMap(sentence -> sentence.get(TokensAnnotation.class).stream())
                        .map(token -> token.get(PartOfSpeechAnnotation.class))
                        .toArray(String[]::new);
    }

    public static String[] lemmatize(String[] tokens) {
        String text = String.join(" ", tokens);
        Annotation document = new Annotation(text);
        pipeline.annotate(document);
        List<CoreMap> sentences = document.get(SentencesAnnotation.class);

        return sentences.stream()
                        .flatMap(sentence -> sentence.get(TokensAnnotation.class).stream())
                        .map(token -> token.get(LemmaAnnotation.class))
                        .toArray(String[]::new);
    }

    
//    public static String convertToJSON(List<CoreMap> sentences) {
//    	
//        Gson gson = new GsonBuilder().setPrettyPrinting().create();
//        List<Map<String, Object>> nodeList = new ArrayList<>();
//        List<Map<String, Object>> linkList = new ArrayList<>();
//
//        for (CoreMap sentence : sentences) {
//            Collection<edu.stanford.nlp.ie.util.RelationTriple> triples = sentence.get(NaturalLogicAnnotations.RelationTriplesAnnotation.class);
//            for (edu.stanford.nlp.ie.util.RelationTriple triple : triples) {
//                String subject = triple.subjectGloss();
//                String relation = triple.relationGloss();
//                String object = triple.objectGloss();
//
//                addNode(nodeList, subject);
//                addNode(nodeList, object);
//                addLink(linkList, subject, object, relation);
//            }
//        }
//
//        Map<String, List<Map<String, Object>>> jsonMap = new HashMap<>();
//        jsonMap.put("nodes", nodeList);
//        jsonMap.put("links", linkList);
//
//        return gson.toJson(jsonMap);
//    }
    
    public static String convertToJSON(List<CoreMap> sentences) {
        
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        List<Map<String, Object>> nodeList = new ArrayList<>();
        List<Map<String, Object>> linkList = new ArrayList<>();

        for (CoreMap sentence : sentences) {
            Collection<edu.stanford.nlp.ie.util.RelationTriple> triples = 
                sentence.get(NaturalLogicAnnotations.RelationTriplesAnnotation.class);
            for (edu.stanford.nlp.ie.util.RelationTriple triple : triples) {
                processTriple(triple, nodeList, linkList);
            }
        }

        Map<String, List<Map<String, Object>>> result = new HashMap<>();
        result.put("nodes", nodeList);
        result.put("links", linkList);
        
        return gson.toJson(result);
    }

    private static void processTriple(edu.stanford.nlp.ie.util.RelationTriple triple, 
                                      List<Map<String, Object>> nodeList, 
                                      List<Map<String, Object>> linkList) {
        String subject = triple.subjectGloss();
        String relation = triple.relationGloss();
        String object = triple.objectGloss();

        addNode(nodeList, subject);
        addNode(nodeList, object);
        addLink(linkList, subject, object, relation);
    }


    private static void addNode(List<Map<String, Object>> nodeList, String nodeName) {
        for (Map<String, Object> node : nodeList) {
            if (node.get("id").equals(nodeName)) {
                return; // Node already exists
            }
        }
        Map<String, Object> nodeMap = new HashMap<>();
        nodeMap.put("id", nodeName);
        nodeList.add(nodeMap);
    }

    private static void addLink(List<Map<String, Object>> linkList, String subject, String object, String relation) {
        Map<String, Object> linkMap = new HashMap<>();
        linkMap.put("source", subject);
        linkMap.put("target", object);
        linkMap.put("relation", relation);
        linkList.add(linkMap);
    }

    public static String relationsGraph(String text) {
        Annotation document = new Annotation(text);
        pipeline.annotate(document);
        List<CoreMap> sentences = document.get(CoreAnnotations.SentencesAnnotation.class);
        return convertToJSON(sentences);
    }

    
}
