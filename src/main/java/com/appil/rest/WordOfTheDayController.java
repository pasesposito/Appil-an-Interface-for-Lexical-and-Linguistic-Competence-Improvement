package com.appil.rest;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.appil.entity.WordOfTheDay;  // Ensure this points to your entity
import com.appil.service.WordOfTheDayService;

@RestController
@RequestMapping("/api/words")
public class WordOfTheDayController {

    @Autowired
    private WordOfTheDayService wordOfTheDayService;

    @GetMapping("/word-of-the-day")
    public ResponseEntity<WordOfTheDay> getWordOfTheDay() throws IOException {
        // Check and create the word of the day
        WordOfTheDay wordOfTheDay = wordOfTheDayService.checkAndCreateWordOfTheDay();
        return ResponseEntity.ok(wordOfTheDay);
    }
}
