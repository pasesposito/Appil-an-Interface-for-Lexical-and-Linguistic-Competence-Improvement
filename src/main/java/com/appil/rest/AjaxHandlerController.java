package com.appil.rest;

import com.appil.dto.ProcessedResponse;
import com.appil.functions.DependencyExtractor;
import com.appil.functions.TextProcessor;
import com.appil.service.FlashcardService;
import com.appil.service.NounIdsService;
import com.appil.service.ProcessedService;
import com.appil.service.UserService;
import com.google.gson.Gson;

import java.util.Collections;
import java.util.concurrent.CompletableFuture;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/ajax")
public class AjaxHandlerController {

    @Autowired
    private ProcessedService processedService;

    @Autowired
    private UserService userService;


    @Autowired
    private TextProcessor textProcessor;
    
    @Autowired
    private FlashcardService flashcardService;
    
    @Autowired
    private NounIdsService nounIdsService;

    @PostMapping("/handleRequest")
    public ResponseEntity<ProcessedResponse> handlePostRequest(
            @RequestParam("fruit") String text,
            @RequestParam("apple") String title,
            @RequestParam("wikiPage") String wikiPage,
            @RequestParam("modified") String modified,
            HttpSession session) {

        ProcessedResponse response = new ProcessedResponse();
        String relations = DependencyExtractor.relationsGraph(text);
       
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = userService.loadUserByEmail(authentication.getName()).getId(); // Assuming getId() method

        try {
            // Process the text and get HTML, card data, and words
            TextProcessor.ProcessedResult result = textProcessor.processText(text);

            // Set the response with HTML, card data, and relations
            response.setText(result.getHtml());
            //response.setCards(result.getCardData());
            response.setRelations(relations);
            response.setAbstracts(Collections.emptyMap()); // Assuming abstracts are empty or needs to be updated
            response.setWords(result.getWords());
                                              
         // Save processed data and flashcards asynchronously
            CompletableFuture<Void> saveProcessedFuture = processedService.saveProcessed(userId, title, text, relations, wikiPage, modified);
            CompletableFuture<Void> saveFlashcardsFuture = flashcardService.saveFlashcards(userId, nounIdsService.getNounIds());

            // Wait for both tasks to complete
            CompletableFuture.allOf(saveProcessedFuture, saveFlashcardsFuture).join();
        } catch (Exception e) {
            e.printStackTrace();
            try {
                TextProcessor.ProcessedResult result = textProcessor.processText(text);
                response.setText(result.getHtml());
                response.setCards(result.getCardData());
                response.setRelations(relations);
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        }

        return ResponseEntity.ok(response);
    }
}
