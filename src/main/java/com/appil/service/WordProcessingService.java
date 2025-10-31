package com.appil.service;

import com.appil.dto.WordDTO;
import com.appil.dto.WordDTO.EntityType;
import com.appil.functions.Nlp;
import edu.stanford.nlp.ling.CoreAnnotations;
import edu.stanford.nlp.ling.CoreLabel;
import edu.stanford.nlp.pipeline.Annotation;
import edu.stanford.nlp.pipeline.StanfordCoreNLP;
import edu.stanford.nlp.util.CoreMap;
import net.sf.extjwnl.JWNLException;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

@Service
public class WordProcessingService {

    @Autowired
    private UserService userService;

    private final LevelService levelService;
    private final NounEnhancementService nounEnhancementService;
    private final SparqlService sparqlService;
    private final WordService wordService;
    
    private String relationGraph = null;

    @Autowired
    public WordProcessingService(LevelService levelService, NounEnhancementService nounEnhancementService, SparqlService sparqlService, WordService wordService) {
        this.levelService = levelService;
        this.nounEnhancementService = nounEnhancementService;
        this.sparqlService = sparqlService;
        this.wordService = wordService;
    }
    
    public List<WordDTO> processText(String text) throws IOException, SQLException, JWNLException {
        int sessionLevel = getSessionLevel();
        
        // Setup Stanford NLP pipeline
        Properties props = new Properties();
        props.setProperty("annotators", "tokenize,ssplit,pos,lemma,depparse,natlog,openie");
        StanfordCoreNLP pipeline = new StanfordCoreNLP(props);
        
        // Annotate the text
        Annotation document = new Annotation(text);
        pipeline.annotate(document);
        
        // Extract sentences from the annotated document
        List<CoreMap> sentences = document.get(CoreAnnotations.SentencesAnnotation.class);
        
        // Extract entities from the NER service
        Set<String> entitySet = new HashSet<>();
        Map<Integer, String> entityTokenMap = new HashMap<>();
        Map<String, EntityType> entityTypeMap = new HashMap<>();  // Map to store entity type information

        try {
            String nerJsonResponse = getNerResponse(text);
            JSONObject jsonResponse = new JSONObject(nerJsonResponse);
            JSONArray entities = jsonResponse.getJSONArray("entities");

            for (int i = 0; i < entities.length(); i++) {
                JSONObject entity = entities.getJSONObject(i);
                String entityText = entity.getString("entity");
                String entityTypeStr = entity.getString("type");

                // Map entity text to its type
                EntityType entityType = determineEntityType(entityTypeStr);
                entitySet.add(entityText);
                entityTypeMap.put(entityText, entityType);

                for (String token : entityText.split(" ")) {
                    // Create a mapping from token to its entity
                    entityTokenMap.putIfAbsent(token.hashCode(), entityText);  // Simplified hash-based approach
                }
            }
        } catch (Exception e) {
            // Handle exceptions
            e.printStackTrace();  // Log the exception
        }

        List<WordDTO> words = new ArrayList<>();
        
        for (CoreMap sentence : sentences) {
            // Extract tokens, tags, and lemmas for each sentence
            List<CoreLabel> tokens = sentence.get(CoreAnnotations.TokensAnnotation.class);
            
            for (CoreLabel token : tokens) {
                String word = token.word();
                String tag = token.get(CoreAnnotations.PartOfSpeechAnnotation.class);
                String lemma = token.get(CoreAnnotations.LemmaAnnotation.class);

                // Check if the word is part of an entity
                boolean isEntity = entitySet.stream().anyMatch(entity -> entity.contains(word));
                EntityType entityType = isEntity ? entityTypeMap.getOrDefault(word, null) : null;
                
                // Set isEntity to false if the entity has no corresponding type
                isEntity = isEntity && entityType != null;
                
                if (word.matches("\\p{Punct}")) {
                    words.add(new WordDTO(word, true));
                } else {
                    words.add(new WordDTO(word, tag, lemma, isEntity, entityType, sentence.toString(), sessionLevel, levelService, nounEnhancementService, sparqlService, wordService));
                }
            }
        }
        
        // Extract relations and add them to the response
        relationGraph = Nlp.relationsGraph(text);
        
        return words;
    }
    
    private String getNerResponse(String text) throws IOException {
        URL url = new URL("http://localhost:5005/ner");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);

        String jsonInputString = "{\"text\": \"" + text + "\"}";

        try (OutputStream os = conn.getOutputStream()) {
            byte[] input = jsonInputString.getBytes("utf-8");
            os.write(input, 0, input.length);
        }

        try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"))) {
            StringBuilder response = new StringBuilder();
            String responseLine;
            while ((responseLine = br.readLine()) != null) {
                response.append(responseLine.trim());
            }
            return response.toString();
        }
    }

    private Set<String> extractEntitySetFromJson(String jsonResponse) {
        Set<String> entitySet = new HashSet<>();
        try {
            JSONObject jsonObject = new JSONObject(jsonResponse);
            JSONArray entitiesArray = jsonObject.getJSONArray("entities");
            for (int i = 0; i < entitiesArray.length(); i++) {
                JSONObject entityObject = entitiesArray.getJSONObject(i);
                String entityText = entityObject.getString("entity");
                entitySet.add(entityText);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return entitySet;
    }

    private int getSessionLevel() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getName() != null) {
            return userService.loadUserByEmail(authentication.getName()).getLevel();
        }
        return -1;
    }

    public String getRelationGraph() {
        return relationGraph;
    }

    public void setRelationGraph(String relationGraph) {
        this.relationGraph = relationGraph;
    }

    public void retrieveEntitiesFromText(String fullText) {
        try {
            // Set up the URL and connection
            URL url = new URL("http://localhost:5005/ner");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            // Create JSON input string
            String jsonInputString = "{\"text\": \"" + fullText + "\"}";

            // Send the request
            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonInputString.getBytes("utf-8");
                os.write(input, 0, input.length);
            }

            // Read the response
            int code = conn.getResponseCode();
            if (code == 200) {
                try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"))) {
                    StringBuilder response = new StringBuilder();
                    String responseLine;
                    while ((responseLine = br.readLine()) != null) {
                        response.append(responseLine.trim());
                    }
                    parseEntities(response.toString());
                }
            } else {
                try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getErrorStream(), "utf-8"))) {
                    StringBuilder errorResponse = new StringBuilder();
                    String errorLine;
                    while ((errorLine = br.readLine()) != null) {
                        errorResponse.append(errorLine.trim());
                    }
                    System.err.println("Error " + code + ": " + errorResponse.toString());
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void parseEntities(String jsonResponse) {
        try {
            JSONObject jsonObject = new JSONObject(jsonResponse);
            JSONArray entitiesArray = jsonObject.getJSONArray("entities");

            for (int i = 0; i < entitiesArray.length(); i++) {
                JSONObject entity = entitiesArray.getJSONObject(i);
                String entityText = entity.getString("entity");
                String entityType = entity.getString("type");
                // Add logic to process or store the entities
                System.out.println("Entity: " + entityText + ", Type: " + entityType);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    private EntityType determineEntityType(String tag) {
        switch (tag) {
            case "PERSON":
                return EntityType.PERSON;
            case "ORG":
                return EntityType.ORGANIZATION;
            case "GPE":
                return EntityType.LOCATION;
            case "DATE":
                return EntityType.DATE;
            case "TIME":
                return EntityType.TIME;
            case "MONEY":
                return EntityType.MONEY;
            case "PERCENT":
                return EntityType.PERCENT;
            case "FAC":
                return EntityType.FACILITY;
            case "NORP":
                return EntityType.NORP;
            case "EVENT":
                return EntityType.EVENT;
            case "LANGUAGE":
                return EntityType.LANGUAGE;
            case "PRODUCT":
                return EntityType.PRODUCT;
            case "WORK_OF_ART":
                return EntityType.WORK_OF_ART;
            case "LAW":
                return EntityType.LAW;
            case "ORDINAL":
                return EntityType.ORDINAL;
            case "CARDINAL":
                return EntityType.CARDINAL;
            default:
                return null; // or a default entity type if applicable
        }
    }
}


//package com.appil.service;
//
//import com.appil.dto.WordDTO;
//import com.appil.functions.Nlp;
//
//import edu.stanford.nlp.ling.CoreAnnotations;
//import edu.stanford.nlp.ling.CoreLabel;
//import edu.stanford.nlp.pipeline.Annotation;
//import edu.stanford.nlp.pipeline.StanfordCoreNLP;
//import edu.stanford.nlp.util.CoreMap;
//import net.sf.extjwnl.JWNLException;
//
//import org.json.JSONArray;
//import org.json.JSONObject;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.stereotype.Service;
//
//import java.io.BufferedReader;
//import java.io.IOException;
//import java.io.InputStreamReader;
//import java.io.OutputStream;
//import java.net.HttpURLConnection;
//import java.net.URL;
//import java.sql.SQLException;
//import java.util.ArrayList;
//import java.util.HashMap;
//import java.util.HashSet;
//import java.util.List;
//import java.util.Map;
//import java.util.Properties;
//import java.util.Set;
//
//@Service
//public class WordProcessingService {
//	
//	@Autowired
//    private UserService userService;
//
//    private final LevelService levelService;
//    private final NounEnhancementService nounEnhancementService;
//    private final SparqlService sparqlService;
//    private final WordService wordService;
//    
//    private String relationGraph = null;
//
//
//    @Autowired
//    public WordProcessingService(LevelService levelService, NounEnhancementService nounEnhancementService, SparqlService sparqlService, WordService wordService) {
//        this.levelService = levelService;
//        this.nounEnhancementService = nounEnhancementService;
//        this.sparqlService = sparqlService;
//        this.wordService = wordService;
//    }
//    
//      
//    public List<WordDTO> processText(String text) throws IOException, SQLException, JWNLException {
//        
//    	int sessionLevel = getSessionLevel();
//    	
//    	
//    	
//        Annotation document = new Annotation(text);
//        
//        Properties props = new Properties();
//        props.setProperty("annotators", "tokenize,ssplit,pos,lemma,depparse,natlog,openie");
//        StanfordCoreNLP pipeline = new StanfordCoreNLP(props);
//        pipeline.annotate(document);
//        
//        // Extract sentences from the annotated document
//        List<CoreMap> sentences = document.get(CoreAnnotations.SentencesAnnotation.class);
//        
//        // Fetch entities from NER service
//        String nerJsonResponse = getNerResponse(text);
//        
//        List<WordDTO> words = new ArrayList<>();
//        Set<String> entitySet = extractEntitySetFromJson(nerJsonResponse);
//        
//        for (CoreMap sentence : sentences) {
//            // Extract tokens, tags, and lemmas for each sentence
//            List<CoreLabel> tokens = sentence.get(CoreAnnotations.TokensAnnotation.class);
//            
//            for (CoreLabel token : tokens) {
//                String word = token.word();
//                String tag = token.get(CoreAnnotations.PartOfSpeechAnnotation.class);
//                String lemma = token.get(CoreAnnotations.LemmaAnnotation.class);
//                
//                
//                boolean isEntity = entities.get(word) != null;
//                
//                if (word.matches("\\p{Punct}")) {
//                    words.add(new WordDTO(word, true));
//                } else {
//                    words.add(new WordDTO(word, tag, lemma, isEntity, sentence.toString(), sessionLevel, levelService, nounEnhancementService, sparqlService, wordService));
//                }
//            }
//        }
//        
//        // Extract relations and add them to the response
//       relationGraph = Nlp.relationsGraph(text);
//        
//        // Handle relations if necessary, e.g., add to the WordDTO or process further
//        
//        return words;
//    }
//    
//    public boolean isEntityInJson(String jsonResponse, String word) {
//        try {
//            JSONObject jsonObject = new JSONObject(jsonResponse);
//            JSONArray entitiesArray = jsonObject.getJSONArray("entities");
//
//            // Create a Set to store entity texts for quick lookup
//            Set<String> entitySet = new HashSet<>();
//            for (int i = 0; i < entitiesArray.length(); i++) {
//                JSONObject entityObject = entitiesArray.getJSONObject(i);
//                String entityText = entityObject.getString("entity");
//                entitySet.add(entityText);
//            }
//
//            // Check if the word is in the set of entities
//            return entitySet.contains(word);
//        } catch (Exception e) {
//            e.printStackTrace();
//            return false;
//        }
//    }
//    
//    
//    // Method to get session level for the current user
//    private int getSessionLevel() {
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        if (authentication != null && authentication.getName() != null) {
//            return userService.loadUserByEmail(authentication.getName()).getLevel();
//        }
//        return -1;
//    }
//
//
//
//
//
//	public String getRelationGraph() {
//		return relationGraph;
//	}
//
//
//
//
//
//	public void setRelationGraph(String relationGraph) {
//		this.relationGraph = relationGraph;
//	}
//	
//	
//	public void retrieveEntitiesFromText(String fullText) {
//		
//	    try {
//	        // Set up the URL and connection
//	        URL url = new URL("http://localhost:5005/ner");
//	        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
//	        conn.setRequestMethod("POST");
//	        conn.setRequestProperty("Content-Type", "application/json");
//	        conn.setDoOutput(true);
//
//	        // Create JSON input string
//	        String jsonInputString = "{\"sentence\": \"" + fullText + "\"}";
//
//	        // Send the request
//	        try (OutputStream os = conn.getOutputStream()) {
//	            byte[] input = jsonInputString.getBytes("utf-8");
//	            os.write(input, 0, input.length);
//	        }
//
//	        // Read the response
//	        int code = conn.getResponseCode();
//	        if (code == 200) {
//	            try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"))) {
//	                StringBuilder response = new StringBuilder();
//	                String responseLine;
//	                while ((responseLine = br.readLine()) != null) {
//	                    response.append(responseLine.trim());
//	                }
//	                parseEntities(response.toString());
//	            }
//	        } else {
//	            try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getErrorStream(), "utf-8"))) {
//	                StringBuilder errorResponse = new StringBuilder();
//	                String errorLine;
//	                while ((errorLine = br.readLine()) != null) {
//	                    errorResponse.append(errorLine.trim());
//	                }
//	                System.err.println("Error " + code + ": " + errorResponse.toString());
//	            }
//	        }
//
//	    } catch (Exception e) {
//	        e.printStackTrace();
//	    }
//	}
//
//	private void parseEntities(String jsonResponse) {
//	    // Parse the JSON response to extract entities and their types
//	    // This could be done using a JSON library like org.json or Gson
//	    // Example using org.json:
//	    try {
//	        org.json.JSONObject jsonObject = new org.json.JSONObject(jsonResponse);
//	        org.json.JSONArray entitiesArray = jsonObject.getJSONArray("entities");
//
//	        for (int i = 0; i < entitiesArray.length(); i++) {
//	            org.json.JSONObject entity = entitiesArray.getJSONObject(i);
//	            String entityText = entity.getString("entity");
//	            String entityType = entity.getString("type");
//	            // Add logic to process or store the entities
//	            // For example, print them
//	            System.out.println("Entity: " + entityText + ", Type: " + entityType);
//	        }
//
//	    } catch (org.json.JSONException e) {
//	        e.printStackTrace();
//	    }
//	}
//	
//	
//}
