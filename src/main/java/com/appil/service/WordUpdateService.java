package com.appil.service;

import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.appil.entity.Word;
import com.appil.repository.WordUpdateRepository;

import jakarta.transaction.Transactional;

@Service
public class WordUpdateService {
	
	@Autowired
	WordUpdateRepository wordUpdateRepository;
	
	public long countByWordAndUser(String word, Long userId) {
        return wordUpdateRepository.countByWordAndUser(word, userId);
    }

    public void incrementCounterLike(String word, Long userId) {
        wordUpdateRepository.incrementCounterLike(word, userId);
    }

    public void incrementCounterDislike(String word, Long userId) {
        wordUpdateRepository.incrementCounterDislike(word, userId);
    }
	
    @Transactional
    public void updateWords(JSONArray words, Long userId, boolean like) {
        for (int i = 0; i < words.length(); i++) {
            String word = words.getString(i);

            // Check if the word exists for the given user
            if (wordUpdateRepository.existsByWordAndUser(word, userId)) {
                if (like) {
                    wordUpdateRepository.incrementCounterLike(word, userId);
                } else {
                    wordUpdateRepository.incrementCounterDislike(word, userId);
                }
            } else {
                // Create a new Word entity if it doesn't exist
                Word newWord = new Word();
                newWord.setWord(word);
                newWord.setUser(userId);

                if (like) {
                    newWord.setCounterLike(1L);
                    newWord.setCounterDislike(0L);
                } else {
                    newWord.setCounterLike(0L);
                    newWord.setCounterDislike(1L);
                }
                wordUpdateRepository.save(newWord);
            }
        }
    }

}
