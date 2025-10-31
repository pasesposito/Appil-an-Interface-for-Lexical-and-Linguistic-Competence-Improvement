package com.appil.rest;

import java.io.IOException;
import java.util.Map;

import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.appil.entity.Noun;
import com.appil.functions.WordNet;
import com.appil.repository.NounRepository;
import com.appil.service.NounService;
import com.appil.service.WordUpdateService;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/words")
public class WordController {
	
	@Autowired
	WordUpdateService wordUpdateService;
	
	@Autowired
    private NounService nounService;
	
	 @PostMapping("/update")
	    public void updateWord(
	            @RequestParam("wordsILike") String wordsILike,
	            @RequestParam("wordsIDontLike") String wordsIDontLike,
	            @RequestParam("userId") Long userId) {

	        // Parse the JSON strings to JSONArray
	        JSONArray wordsILikeArray = new JSONArray(wordsILike);
	        JSONArray wordsIDontLikeArray = new JSONArray(wordsIDontLike);

	        // Call the service to update words the user likes
	        wordUpdateService.updateWords(wordsILikeArray, userId, true);

	        // Call the service to update words the user doesn't like
	        wordUpdateService.updateWords(wordsIDontLikeArray, userId, false);
	    }
	
	
	 @PostMapping("/getWord")
	    public ResponseEntity<Noun> getWord() {
	        Noun randomNoun = nounService.getRandomNoun(); // Get a random noun by ID
	        return ResponseEntity.ok(randomNoun); // Return it as a JSON response
	    }
	
	 
	 @GetMapping("/synonyms")
	 public ResponseEntity<Object> getSynonyms(@RequestParam("word") String word) {
	     if (word == null || word.trim().isEmpty()) {
	         return ResponseEntity.badRequest().body("La parola è obbligatoria");
	     }
	     try {
	         // Ottieni i sinonimi per la parola richiesta
	         String json = WordNet.JSONGen(word, "NN");
	         System.out.println(json);

	         if (json != null && !json.isEmpty()) {
	             // Convert JSON String to a Map
	             ObjectMapper objectMapper = new ObjectMapper();
	             Map<String, Object> jsonMap = objectMapper.readValue(json, Map.class);
	             return ResponseEntity.ok(jsonMap);
	         } else {
	             return ResponseEntity.status(404).body("Sinonimi non trovati per la parola: " + word);
	         }
	     } catch (Exception e) {
	         e.printStackTrace();
	         return ResponseEntity.status(500).body("Errore nel recupero dei sinonimi");
	     }
	 }
	

}
