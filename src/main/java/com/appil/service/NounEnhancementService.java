package com.appil.service;

import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.appil.dto.WordImageDTO;
import com.appil.entity.Noun;
import com.appil.repository.NounRepository;

import java.io.IOException;
import java.util.Optional;

@Service
public class NounEnhancementService {

    @Autowired
    private NounRepository nounRepository;

   
    @Autowired
    private SparqlService sparqlService; 

   
    public WordImageDTO enhanceNoun(String word) {
    	
        WordImageDTO imageInfo = new WordImageDTO();

        if (word == null || word.trim().isEmpty()) {
            // Handle invalid input
            imageInfo.setTitle("Invalid input");
            return imageInfo;
        }

        // Fetch the noun from the repository
        Optional<Noun> optionalNoun = nounRepository.findByWord(word);

        if (optionalNoun.isPresent()) {
            Noun noun = optionalNoun.get();
            imageInfo.setTitle(Optional.ofNullable(noun.getImgTitle()).orElse("No title available"));
            imageInfo.setLink(Optional.ofNullable(noun.getImg()).orElse("No image link available"));
            imageInfo.setLicense(Optional.ofNullable(noun.getImgLicense()).orElse("No license information available"));
            imageInfo.setCredit(Optional.ofNullable(noun.getImgCredit()).orElse("No credit information available"));
            imageInfo.setAuthor(Optional.ofNullable(noun.getImgAuthor()).orElse("No author information available"));
            imageInfo.setDescription(Optional.ofNullable(noun.getImgDescription()).orElse("No description available"));
        } else {
            // Handle the case where the noun is not found
            imageInfo.setTitle("Noun not found");
        }

        return imageInfo;
    }
    
    
       
    
}
