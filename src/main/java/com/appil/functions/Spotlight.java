package com.appil.functions;

import edu.stanford.nlp.pipeline.*;
import edu.stanford.nlp.ling.CoreAnnotations;
import edu.stanford.nlp.ling.CoreLabel;
import edu.stanford.nlp.pipeline.CoreDocument;
import edu.stanford.nlp.util.Pair;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class Spotlight {
	
	public static HashMap<String, List<String>> words = new HashMap<String, List<String>>();
	public static List<String> multiword = new ArrayList<String>();
	public static HashMap<Integer, String> resources = new HashMap<Integer, String>();
	public static HashMap<String, Integer> indexes = new HashMap<String, Integer>();

    public static void main(String[] args) {
        Spotlight.mapEntities("INDIANAPOLIS -- Midway through the second quarter of Sunday's NBA All-Star Game inside Gainbridge Fieldhouse, LeBron James secured an outlet pass with his left hand and, in one smooth motion, looped a pass over the head of Damian Lillard and into the hands of Western Conference teammate Paul George.\r\n"
                + "\r\n"
                + "");
    }

    public static Map<String, List<String>> mapEntities(String text) {
    	
        Map<String, List<String>> entities = new HashMap<>();

        // set up pipeline properties
        Properties props = new Properties();
        props.setProperty("annotators", "tokenize,pos,lemma,ner");
        // example customizations (these are commented out but you can uncomment them to see the results

        // disable fine-grained ner
        props.setProperty("ner.applyFineGrained", "true");

        // set up pipeline
        StanfordCoreNLP pipeline = new StanfordCoreNLP(props);
        // make an example document
        CoreDocument doc = new CoreDocument(text);

        pipeline.annotate(doc);
        
        List<String> lista = new ArrayList<String>();
        
        int indice = 0;

        // view results
        for (CoreEntityMention em : doc.entityMentions()) {
        	
            String entityType = em.entityType();
            String word = em.text();
            multiword.add(word);
           
            words.put("words", null);
                      
            
            String wordUpper = word;
            wordUpper = Character.toUpperCase(word.charAt(0)) + wordUpper.substring(1);
            
                       
            HashMap<String, String> sparql = Sparql.search(wordUpper, entityType);
            
            String[] multiWord = word.split("\\s+");
            
            for (String w : multiWord) {
            	
            	resources.put(indice, sparql.get("word"));
            	indexes.put(w, indice);
            	lista.add(w);
            	
           }
            
            indice++;                     
            
            // Add the word to the list associated with the entity type
            entities.computeIfAbsent(entityType, k -> new ArrayList<>()).add(word); 
        }
        
        words.put("words", lista);
        
      
        return entities;
    }
}
