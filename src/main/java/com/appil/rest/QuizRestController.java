package com.appil.rest;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.appil.dto.NounDTO;
import com.appil.entity.Noun;
import com.appil.repository.NounRepository;


@RestController
@RequestMapping("/api/noun")
public class QuizRestController {

    @Autowired
    private NounRepository nounRepository;

    @PostMapping("/retrieve")
    public ResponseEntity<?> getNoun(@RequestBody Map<String, String> requestBody) {
    	
        String word = requestBody.get("word");
        if (word == null || word.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Word parameter is missing or empty.");
        }
        
        try {
            // Retrieve the noun from the repository
            Optional<Noun> nounOptional = nounRepository.findByWord(word);

            if (nounOptional.isPresent()) {
                Noun noun = nounOptional.get();
                
                // Convert Noun to NounDTO
                NounDTO nounDTO = new NounDTO();
                nounDTO.setIdNoun(noun.getIdNoun());
                nounDTO.setAbs(noun.getAbs());
                nounDTO.setAbsIt(noun.getAbsIt());
                nounDTO.setCombinedScore(noun.getCombinedScore());
                nounDTO.setIdLevel(noun.getIdLevel());
                nounDTO.setImg(noun.getImg());
                nounDTO.setImgAuthor(noun.getImgAuthor());
                nounDTO.setImgCredit(noun.getImgCredit());
                nounDTO.setImgDescription(noun.getImgDescription());
                nounDTO.setImgLicense(noun.getImgLicense());
                nounDTO.setImgTitle(noun.getImgTitle());
                nounDTO.setLabelIt(noun.getLabelIt());
               
                nounDTO.setLevel(noun.getLevel()); // Ensure `getLevel()` is present in DTO
                nounDTO.setStemDiff(noun.getStemDiff()); // Ensure `getStemDiff()` is present in DTO
                nounDTO.setWikiPage(noun.getWikiPage()); // Correctly set `wikiPage` in DTO
                nounDTO.setWord(noun.getWord());

                return ResponseEntity.ok(nounDTO);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            // Log the exception for debugging
            e.printStackTrace();
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }
}

