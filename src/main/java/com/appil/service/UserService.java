package com.appil.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.appil.entity.User;
import com.appil.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public boolean isEmailTaken(String email) {
        return userRepository.findByEmail(email) != null;
    }
    
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }
    
    public Long getUserPoints(Long userId) {
        return userRepository.findPointsById(userId);
    }

    public void registerUser(User user) {
        
    	user.setEnabled(false);
    	
    	user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }
    
    public List<User> findAllPendingUsers() {
        return userRepository.findByEnabled(false);
    }

    public void confirmUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setEnabled(true);
        userRepository.save(user);
    }
    
    public List<User> getUsersByRole(User.Role role) {
        return userRepository.findByRole(role);
    }

    public void assignRole(Long userId, User.Role role) {
    	
        User user = userRepository.getReferenceById(userId);
        user.setRole(role);
        userRepository.save(user);
    }    
      

	@Transactional
    public User loadUserByEmail(String email) {
        return userRepository.findByEmail(email);
        
    }
    
   
    

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Load user by email (as email is used as the username)
        User user = userRepository.findByEmail(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with email: " + username);
        }

        // Convert the User entity to a UserDetails object expected by Spring Security
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(user.getRole().name())
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(!user.isEnabled()) // Use the enabled field to determine if the account is active
                .build();
    }
}
