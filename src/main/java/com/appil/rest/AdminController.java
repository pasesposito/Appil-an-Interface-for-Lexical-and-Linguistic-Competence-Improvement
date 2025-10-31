package com.appil.rest;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.appil.entity.User;
import com.appil.service.UserService;

@RestController
@RequestMapping("/admindashboard")
public class AdminController {

    @Autowired
    private UserService userService;
    
  
    @GetMapping("/pending-users")
    public List<User> getPendingUsers() {
        // Fetch users where enabled = false
        return userService.findAllPendingUsers();
    }

    @PostMapping("/confirm-user/{userId}")
    public ResponseEntity<String> confirmUser(@PathVariable Long userId) {
        userService.confirmUser(userId);
        return ResponseEntity.ok("User confirmed");
    }
    
    @PostMapping("/assign-role/{userId}")
    public ResponseEntity<String> assignRole(@PathVariable Long userId, @RequestParam User.Role role) {
        try {
            userService.assignRole(userId, role);
            return ResponseEntity.ok("Role assigned successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error assigning role");
        }
    }


    
    @GetMapping("/all-users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.findAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users-by-role")
    public ResponseEntity<List<User>> getUsersByRole(@RequestParam User.Role role) {
        List<User> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }
}
