package com.appil.rest;

import com.appil.service.PointsService;
import com.appil.service.UserService;

import org.apache.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/points")
public class PointsController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private PointsService pointsService;

    /**
     * Get points for a specific user.
     *
     * @param userId The ID of the user.
     * @return A ResponseEntity containing the user's points.
     */
//    @GetMapping("/{userId}")
//    public ResponseEntity<?> getPoints(@PathVariable Long userId) {
//        try {
//            Long points = userService.getUserPoints(userId);
//            if (points != null) {
//                return ResponseEntity.ok(points);
//            } else {
//                return ResponseEntity.notFound().build();
//            }
//        } catch (Exception e) {
//            // Handle unexpected errors
//            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
//        }
//    }
    
	    @GetMapping("/retrieve")
	    public ResponseEntity<?> getPoints() {
	    	
	        try {
	            // Retrieve the current Authentication object from the SecurityContext
	            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
	
	            
	            Long userId = null;
	            if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
	                UserDetails userDetails = (UserDetails) authentication.getPrincipal();
	                
	                userId = userService.loadUserByEmail(userDetails.getUsername()).getId(); 
	                
	            }
	
	            if (userId == null) {
	                return ResponseEntity.status(401).body("User not authenticated");
	            }
	
	            Long points = userService.getUserPoints(userId);
	            if (points != null) {
	                return ResponseEntity.ok(points);
	            } else {
	                return ResponseEntity.notFound().build();
	            }
	        } catch (Exception e) {
	            // Handle unexpected errors
	            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
	        }
	    }
    
    /**
     * Subtract points from a specific user.
     *
     * @param userId The ID of the user.
     * @param points The number of points to subtract.
     * @return A ResponseEntity indicating the result of the operation.
     */
	    @PostMapping("/subtract/{points}")
	    public ResponseEntity<?> subtractPoints(@PathVariable Long points) {
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

	            boolean success = pointsService.subtractPoints(userId, points);
	            if (success) {
	                return ResponseEntity.ok("Points successfully subtracted.");
	            } else {
	                return ResponseEntity.badRequest().body("Failed to subtract points. User might not exist or points may be insufficient.");
	            }
	        } catch (Exception e) {
	            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
	        }
	    }
	    	    
	    
	    @PostMapping("/add/{points}")
	    public ResponseEntity<?> addPoints(@PathVariable Long points) {
	        try {
	            // Retrieve the current Authentication object from the SecurityContext
	            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

	            if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails)) {
	                return ResponseEntity.status(401).body("{\"message\": \"User not authenticated\"}");
	            }

	            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
	            Long userId = userService.loadUserByEmail(userDetails.getUsername()).getId();

	            if (userId == null) {
	                return ResponseEntity.status(401).body("{\"message\": \"User not authenticated\"}");
	            }

	            boolean success = pointsService.addPoints(userId, points);
	            if (success) {
	                return ResponseEntity.ok("{\"message\": \"Points successfully added.\"}");
	            } else {
	                return ResponseEntity.badRequest().body("{\"message\": \"Failed to add points. User might not exist or points may be insufficient.\"}");
	            }
	        } catch (Exception e) {
	            return ResponseEntity.status(500).body("{\"message\": \"An error occurred: " + e.getMessage() + "\"}");
	        }
	    }

	    
//	    @PostMapping("/add/{points}")
//	    public ResponseEntity<?> addPoints(@PathVariable int points) {
//	        try {
//	            // Retrieve the current Authentication object from the SecurityContext
//	            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//
//	            if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails)) {
//	                return ResponseEntity.status(401).body("User not authenticated");
//	            }
//
//	            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
//	            Long userId = userService.loadUserByEmail(userDetails.getUsername()).getId();
//
//	            if (userId == null) {
//	                return ResponseEntity.status(401).body("User not authenticated");
//	            }
//
//	            boolean success = pointsService.addPoints(userId, points);
//	            if (success) {
//	                return ResponseEntity.ok("Points successfully subtracted.");
//	            } else {
//	                return ResponseEntity.badRequest().body("Failed to subtract points. User might not exist or points may be insufficient.");
//	            }
//	        } catch (Exception e) {
//	            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
//	        }
//	    }

//    @PostMapping("/subtract")
//    public ResponseEntity<?> subtractPoints(@RequestParam Long userId, @RequestParam int points) {
//        try {
//            boolean success = pointsService.subtractPoints(userId, points);
//            if (success) {
//                return ResponseEntity.ok("Points successfully subtracted.");
//            } else {
//                return ResponseEntity.badRequest().body("Failed to subtract points. User might not exist.");
//            }
//        } catch (Exception e) {
//            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
//        }
//    }
	    
	    
	    
}
