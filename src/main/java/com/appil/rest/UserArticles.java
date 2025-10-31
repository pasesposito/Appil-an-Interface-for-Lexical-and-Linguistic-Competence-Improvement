package com.appil.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.appil.entity.Processed;
import com.appil.service.UserService;
import com.appil.repository.ProcessedRepository;

import java.util.List;

@RestController
@RequestMapping("/api/userarticles")
public class UserArticles {
    
    @Autowired
    private UserService userService;

    @Autowired
    private ProcessedRepository processedRepository;

//    @GetMapping("/getall")
//    public ResponseEntity<?> getArticle() {
//        // Retrieve the current Authentication object from the SecurityContext
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        
//        Long userId = null;
//        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
//            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
//            
//            userId = userService.loadUserByEmail(userDetails.getUsername()).getId(); 
//        }
//
//        if (userId == null) {
//            return ResponseEntity.status(401).body("User not authenticated");
//        }
//        
//        List<Processed> processedList = processedRepository.findAllByUserId(userId);
//        
//        if (processedList.isEmpty()) {
//            return ResponseEntity.status(404).body("No articles found for this user");
//        }
//        
//        return ResponseEntity.ok(processedList);
//    }
//    
    
    @GetMapping("/getall")
    public ResponseEntity<?> getAllProcessedArticles() {
        // Retrieve the current Authentication object from the SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = null;

        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            userId = userService.loadUserByEmail(userDetails.getUsername()).getId();
        }

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        List<Processed> processedArticles = processedRepository.findAllByUserId(userId);
        return ResponseEntity.ok(processedArticles);
    }
}
