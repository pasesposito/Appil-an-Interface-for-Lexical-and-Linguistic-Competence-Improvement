package com.appil.controller;


import java.io.IOException;
import java.net.http.HttpRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.WebAttributes;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.appil.service.SessionManagementService;
import com.appil.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;


@Controller
public class LoginController implements AuthenticationSuccessHandler {

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    
	@Autowired
    private UserService userService;
	
	private final SessionManagementService sessionManagementService;
	
	public LoginController(SessionManagementService sessionManagementService) {
        this.sessionManagementService = sessionManagementService;
    }
		

//    @PostMapping("/login")
//    public String login(@RequestParam("emailId") String email, @RequestParam("pwd") String password, jakarta.servlet.http.HttpServletRequest request , HttpSession session, Model model) {
//        
//        // Log the incoming email for debugging purposes
//        System.out.println("Attempting to log in with email: " + email);
//
//        UserDetails user = userService.loadUserByUsername(email);
//      
//        if (user != null ) {          
//
//           if (passwordEncoder.matches(password, user.getPassword())) {  	                        
//               
//                return "redirect:/home";
//                
//            } else {
//                System.out.println("Password does not match");
//                model.addAttribute("errorMessage", "Invalid email or password");
//            }
//        } else {
//            System.out.println("User not found with email: " + email);
//            model.addAttribute("errorMessage", "Invalid email or password");
//        }
//                
//        
//        return "login"; // Reload the login page
//    }
    	
	@PostMapping("/login")
	public String login(@RequestParam("emailId") String email,
	                    @RequestParam("pwd") String password,
	                    RedirectAttributes redirectAttributes) {

	    UserDetails user = userService.loadUserByUsername(email);
	    redirectAttributes.addFlashAttribute("errorMessage", "Invalid email or password");

	    
	    return "redirect:/home";
	   
	}
	
	
	@GetMapping("/login-error")
    public String login(HttpServletRequest request, Model model) {
		
        HttpSession session = request.getSession(false);
        String errorMessage = "Invalid email or password. Please retry.";
        
//        if (session != null) {
//            AuthenticationException ex = (AuthenticationException) session
//                    .getAttribute(WebAttributes.AUTHENTICATION_EXCEPTION);
//            if (ex != null) {
//                errorMessage = ex.getMessage();
//            }
//        }
//        
        model.addAttribute("errorMessage", errorMessage);
        return "login";
    }
	


    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        HttpSession session = request.getSession();
        sessionManagementService.setSessionAttributes(session, authentication.getName());

        response.sendRedirect("/defaultSuccessUrl");
    }


}
