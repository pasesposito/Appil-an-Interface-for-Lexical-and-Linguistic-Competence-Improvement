package com.appil.rest;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.appil.dto.FlashcardDTO;
import com.appil.entity.Flashcard;
import com.appil.service.FlashcardService;
import com.appil.service.UserService;


@RestController
@RequestMapping("/api/flashcards")
public class FlashcardController {
	
	 @Autowired
	 private UserService userService;
	 
	 @Autowired
	 private FlashcardService flashcardService;
	 
	 
	 @GetMapping("/all")
	    public ResponseEntity<?> getAllFlashcardsForUser() {
	        try {
	            // Retrieve the current Authentication object from the SecurityContext
	            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

	            if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails)) {
	                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
	            }

	            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
	            Long userId = userService.loadUserByEmail(userDetails.getUsername()).getId();

	            if (userId == null) {
	                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
	            }
	            
	            // Retrieve all flashcards for the user from the service
	            List<FlashcardDTO> flashcards = flashcardService.getAllFlashcardsForUser(userId);

	            if (flashcards.isEmpty()) {
	                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No flashcards found for this user");
	            } else {
	                return ResponseEntity.ok(flashcards);
	            }
	            
	        } catch (Exception e) {
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
	        }
	    }
	
	@PostMapping("/get")
    public ResponseEntity<?> subtractPoints(@PathVariable int points) {
        try {
            // Retrieve the current Authentication object from the SecurityContext
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails)) {
                return ResponseEntity.status(401).body("User not authenticated");
            }

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();         
			Long userId = userService.loadUserByEmail(userDetails.getUsername()).getId();

            if (userId == null) {
                return ResponseEntity.status(401).body("User not authenticated");
            }
            
            // Retrieve flashcards from the service
            List<FlashcardDTO> flashcards = flashcardService.getAllFlashcardsForUser(userId);
            
            return ResponseEntity.ok(flashcards);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }

}
