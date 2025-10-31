package com.appil.rest;

import com.appil.entity.Article;
import com.appil.repository.ArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Optional;

@RestController
@RequestMapping("/api/articles")
public class GetTextsRest {

    @Autowired
    private ArticleRepository articleRepository;

    /**
     * Endpoint to get the details of an article based on the featured date.
     * 
     * @param featuredDate the date of the article to retrieve
     * @return the article details or an error message
     */
    @GetMapping("/GetArticle")
    public Object getArticle(@RequestParam("featured_date") String featuredDate) {
        if (featuredDate == null || featuredDate.trim().isEmpty()) {
            return "{\"status\":\"error\",\"message\":\"Featured date is required\"}";
        }

        try {
            Optional<Article> article = articleRepository.findByFeaturedDate(LocalDate.parse(featuredDate));

            if (article.isPresent()) {
                return article.get();  // Spring will automatically convert the Article object to JSON
            } else {
                return "{\"status\":\"error\",\"message\":\"Article not found\"}";
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "{\"status\":\"error\",\"message\":\"" + e.getMessage() + "\"}";
        }
    }

    /**
     * Endpoint to check if an article exists based on the featured date.
     * 
     * @param featuredDate the date to check
     * @return a JSON indicating whether the article exists or not
     */
    @GetMapping("/CheckArticle")
    public String checkArticle(@RequestParam("featured_date") String featuredDate) {
        if (featuredDate == null || featuredDate.trim().isEmpty()) {
            return "{\"status\":\"error\",\"message\":\"Missing parameters\"}";
        }

        try {
            LocalDate date = LocalDate.parse(featuredDate);
            boolean exists = articleRepository.existsByFeaturedDate(date);

            return "{\"exists\":" + exists + "}";
        } catch (Exception e) {
            e.printStackTrace();
            return "{\"status\":\"error\",\"message\":\"" + e.getMessage() + "\"}";
        }
    }

    /**
     * Endpoint to store a new article.
     * 
     * @param article the article data to store
     * @return a JSON indicating the success or failure of the operation
     */
    @PostMapping("/storeData")
    public ResponseEntity<String> storeData(@RequestBody Article article) {
    	
        if (article.getTitle() == null || article.getTitle().trim().isEmpty()) {
            return new ResponseEntity<>("{\"status\":\"error\",\"message\":\"Title is required\"}", HttpStatus.BAD_REQUEST);
        }

        try {
            // Check if the article already exists
        	int count = articleRepository.countByTitle(article.getTitle());
            
            if (count > 0) {
                return new ResponseEntity<>("{\"status\":\"error\",\"message\":\"Article already exists\"}", HttpStatus.CONFLICT);
            }

            // Save the new article
            articleRepository.save(article);
            return new ResponseEntity<>("{\"status\":\"success\"}", HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("{\"status\":\"error\",\"message\":\"" + e.getMessage() + "\"}", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    
    @PostMapping("/storeEmptyArticle")
    public ResponseEntity<String> storeEmptyArticle(@RequestBody LocalDate date) {
        // Check if the date is null
        if (date == null) {
            return new ResponseEntity<>("{\"status\":\"error\",\"message\":\"Date is required\"}", HttpStatus.BAD_REQUEST);
        }

        try {
            // Create a new Article with the provided date and empty other fields
            Article article = new Article();
            article.setFeaturedDate(date); // Convert LocalDate to String if your Article class requires a String            

            // Save the new article
            articleRepository.save(article);
            return new ResponseEntity<>("{\"status\":\"success\"}", HttpStatus.OK);
            
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("{\"status\":\"error\",\"message\":\"" + e.getMessage() + "\"}", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
