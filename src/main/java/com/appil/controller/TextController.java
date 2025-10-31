package com.appil.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TextController {
	
	@GetMapping("/process")
    public String greeting() {
		
		return "Hello";

    }


}
