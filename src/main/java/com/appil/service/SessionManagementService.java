package com.appil.service;

import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpSession;

@Service
public class SessionManagementService {

    public void setSessionAttributes(HttpSession session, String userName) {
    	
        session.setAttribute("userName", userName);
      
    }
}
