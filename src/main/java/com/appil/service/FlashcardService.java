package com.appil.service;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.appil.dto.FlashcardDTO;
import com.appil.entity.Flashcard;
import com.appil.entity.Noun;
import com.appil.entity.User;
import com.appil.repository.FlashcardRepository;
import com.appil.repository.NounRepository;
import com.appil.repository.UserRepository;

@Service
public class FlashcardService {
	
    @Autowired
    private NounRepository nounRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FlashcardRepository flashcardRepository;

    public Optional<Flashcard> getAllFlashcards(Long idUser) {
        return flashcardRepository.findById(idUser);
    }
    
    public List<FlashcardDTO> getAllFlashcardsForUser(Long userId) {
        return flashcardRepository.findAllByUserIdWithNoun(userId);
    }
    
    
    public Noun saveFlashcard(FlashcardDTO flashcardDTO) {
    	
        Noun noun = new Noun();

        noun.setIdNoun(flashcardDTO.getIdNoun());
        noun.setIdLevel(flashcardDTO.getIdLevel());
        noun.setWord(flashcardDTO.getWord());
        noun.setImg(flashcardDTO.getImg());
        noun.setImgCredit(flashcardDTO.getImgCredit());
        noun.setImgAuthor(flashcardDTO.getImgAuthor());
        noun.setImgDescription(flashcardDTO.getImgDescription());
        noun.setImgLicense(flashcardDTO.getImgLicense());
        noun.setAbs(flashcardDTO.getAbs());
        noun.setLabelIt(flashcardDTO.getLabelIt());
        noun.setWikiPage(flashcardDTO.getWikiPage());
        noun.setAbsIt(flashcardDTO.getAbsIt());
        noun.setImgTitle(flashcardDTO.getImgTitle());

        return nounRepository.save(noun);
    }

    
//    public void saveFlashcards(Long userId, List<Long> list) {
//        // Fetch the User entity
//        User user = userRepository.findById((long) userId)
//            .orElseThrow(() -> new RuntimeException("User not found"));
//
//        for (Long nounId : list) {
//            // Fetch the Noun entity
//            Noun noun = nounRepository.findById((long) nounId)
//                .orElseThrow(() -> new RuntimeException("Noun not found"));
//
//            // Create a new Flashcard instance
//            Flashcard flashCard = new Flashcard();
//            flashCard.setUser(user); // Set the User entity
//            flashCard.setNoun(noun); // Set the Noun entity
//
//            // Save the Flashcard instance
//            flashcardRepository.save(flashCard);
//        }
//    }
//    
    public CompletableFuture<Void> saveFlashcards(Long userId, List<Long> nounIds) {
        return CompletableFuture.runAsync(() -> {
            try {
                // Fetch the User entity
                User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

                for (Long nounId : nounIds) {
                    // Fetch the Noun entity
                    Noun noun = nounRepository.findById(nounId)
                        .orElseThrow(() -> new RuntimeException("Noun not found"));

                    // Check if flashcard already exists
                    boolean exists = flashcardRepository.existsByUserAndNoun(user, noun);
                    if (!exists) {
                        // Create a new Flashcard instance
                        Flashcard flashCard = new Flashcard();
                        flashCard.setUser(user); // Set the User entity
                        flashCard.setNoun(noun); // Set the Noun entity

                        // Save the Flashcard instance
                        flashcardRepository.save(flashCard);
                    }
                }
            } catch (Exception e) {
                // Handle exceptions, log errors, etc.
                e.printStackTrace();
                // Consider rethrowing or wrapping the exception if needed
            }
        });
    }
    
}

