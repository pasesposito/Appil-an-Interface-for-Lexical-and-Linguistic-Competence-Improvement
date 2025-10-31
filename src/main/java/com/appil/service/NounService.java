package com.appil.service;

import java.util.List;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.appil.entity.Noun;
import com.appil.repository.NounRepository;

@Service
public class NounService {
	
	@Autowired
    private NounRepository nounRepository;

	public Noun getRandomNoun() {
		
        Random random = new Random();
        
        Long randomId = (long) (random.nextInt(3000) + 1); // +1 to ensure it's between 1 and 3000

        // Find the noun by the generated ID
        return nounRepository.findById(randomId)
                .orElseThrow(() -> new RuntimeException("Noun not found for ID: " + randomId));
    }

}
