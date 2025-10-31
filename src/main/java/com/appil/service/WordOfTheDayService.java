package com.appil.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.appil.entity.Noun;
import com.appil.entity.WordOfTheDay;  
import com.appil.repository.WordOfTheDayRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class WordOfTheDayService {

    @Autowired
    private WordOfTheDayRepository wordOfTheDayRepository;
    
    @Autowired
    private NounService nounService;

    public WordOfTheDay checkAndCreateWordOfTheDay() throws IOException {
    	
        LocalDate today = LocalDate.now();

        // Check if the word for today already exists
        Optional<WordOfTheDay> existingWord = wordOfTheDayRepository.findByDate(today);
        
        if (existingWord.isPresent()) {
            // If it exists, return the existing word
            return existingWord.get();
        } else {
            Noun noun;
            WordOfTheDay newWordOfTheDay = new WordOfTheDay();
            
            // Loop to find a new noun until an unused word is found
            do {
                noun = nounService.getRandomNoun();
                System.out.println(noun);
                
            } while (wordOfTheDayRepository.findByWord(noun.getWord()).isPresent());
            
            // Set the new word details
            newWordOfTheDay.setWord(noun.getWord());
            newWordOfTheDay.setAbs(noun.getAbs());
            
            String jsonResponse = generateWordGraph(noun.getWord());
            
			if (jsonResponse != null) {
				newWordOfTheDay.setGraph(jsonResponse); // Store the entire graph as JSON
				newWordOfTheDay.setDefinitions(extractDefinitionsAsJSON(jsonResponse)); // Extract and store definitions
			}
            
            newWordOfTheDay.setDate(today); // Set today's date
            
            // Save the new entry to the database
            return wordOfTheDayRepository.save(newWordOfTheDay);
        }
    }
    
    public String generateWordGraph(String word) throws IOException {
        URL url = new URL("http://localhost:5005/generate-word-graph"); // Change the port if needed
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);

        // Prepare the JSON input string
        String jsonInputString = "{\"word\": \"" + word + "\"}";

        // Send the request
        try (OutputStream os = conn.getOutputStream()) {
            byte[] input = jsonInputString.getBytes("utf-8");
            os.write(input, 0, input.length);
        }

        // Read the response
        StringBuilder response = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"))) {
            String responseLine;
            while ((responseLine = br.readLine()) != null) {
                response.append(responseLine.trim());
            }
        }

        // Return the response
        return response.toString();
    }
    
    
    private String extractDefinitionsAsJSON(String jsonResponse) throws JsonProcessingException {
        List<String> definitionsList = new ArrayList<>();
        
        try {
            JsonNode rootNode = new ObjectMapper().readTree(jsonResponse);
            JsonNode wordsNode = rootNode.path("relation_graph").path("words");

            for (JsonNode wordNode : wordsNode) {
                String id = wordNode.path("id").asText();
                String label = wordNode.path("label").asText();
                if (id.contains("_definition")) { // Check if this node is a definition
                    definitionsList.add(label); // Add the definition to the list
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        // Create a JSON array to hold the definitions
        ObjectMapper objectMapper = new ObjectMapper();
        ArrayNode jsonArray = objectMapper.createArrayNode();
        
        for (String definition : definitionsList) {
            jsonArray.add(definition); // Add each definition to the JSON array
        }

        // Convert the JSON array to a string for storage
        return objectMapper.writeValueAsString(jsonArray); // Return the JSON formatted string
    }
   
    
    private String extractDefinitionsAsHTML(String jsonResponse) {
        // Use Jackson or another JSON library to parse the response
        List<String> definitionsList = new ArrayList<>();
        
        try {
            JsonNode rootNode = new ObjectMapper().readTree(jsonResponse);
            JsonNode wordsNode = rootNode.path("relation_graph").path("words");

            for (JsonNode wordNode : wordsNode) {
                String id = wordNode.path("id").asText();
                String label = wordNode.path("label").asText();
                if (id.contains("_definition")) { // Check if this node is a definition
                    definitionsList.add(label); // Add the definition to the list
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        // Convert the definitions list to an HTML unordered list
        StringBuilder htmlList = new StringBuilder("<ul>");
        for (String definition : definitionsList) {
            htmlList.append("<li>").append(definition).append("</li>");
        }
        htmlList.append("</ul>");

        return htmlList.toString(); // Return the HTML formatted string
    }
}
