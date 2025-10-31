package com.appil.functions;

import com.appil.service.HtmlGenerationService;
import com.appil.service.NounIdsService;
import com.appil.service.CardDataService;
import com.appil.service.FlashcardService;
import com.appil.service.WordProcessingService;

import net.sf.extjwnl.JWNLException;

import com.appil.dto.WordDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * TextProcessor handles the integration of text processing, HTML generation, and card data services.
 */
@Component
public class TextProcessor {

    private final WordProcessingService wordProcessingService;
    private final HtmlGenerationService htmlGenerationService;
    private final CardDataService cardDataService;
  
    
    private String relations;
    
   

    @Autowired
    public TextProcessor(WordProcessingService wordProcessingService, 
                         HtmlGenerationService htmlGenerationService, 
                         CardDataService cardDataService) {
        this.wordProcessingService = wordProcessingService;
        this.htmlGenerationService = htmlGenerationService;
        this.cardDataService = cardDataService;
        
    }

    /**
     * Processes the provided text to extract words and generate HTML content.
     * 
     * @param text The text to be processed.
     * @return A processed result containing HTML and card data.
     * @throws IOException If an I/O error occurs.
     * @throws SQLException If a database access error occurs.
     * @throws JWNLException If a JWNL error occurs.
     */
    public ProcessedResult processText(String text) throws IOException, SQLException, JWNLException {
    	
        // Process the text to extract words
        List<WordDTO> words = wordProcessingService.processText(text);
        
                
        // Generate HTML from the processed words
        String html = htmlGenerationService.generateHtml(words);

        // Generate card data from the processed words
        //String cardData = cardDataService.generateCardData(words);

        // Return a combined result
        return new ProcessedResult(html, null, words);
    }

    public static class ProcessedResult {
        private final String html;
        private final String cardData;
        private final List<WordDTO> words;
        private final Float combinedScore;
        private final Float stemDifference;
        private final Float levenhensteinDistance;

        public ProcessedResult(String html, String cardData, List<WordDTO> words) {
            this.html = html;
            this.cardData = cardData;
            this.words = words;
            
            Map<String, Float> metrics = calculateMetrics(words);
                       
            this.combinedScore = metrics.getOrDefault("combined", 0f);  
            this.stemDifference = metrics.getOrDefault("stemDifference", 0f);
            this.levenhensteinDistance = metrics.getOrDefault("levenshteinDistance", 0f);

        }

        public String getHtml() {
            return html;
        }

        public String getCardData() {
            return cardData;
        }

        public List<WordDTO> getWords() {
            return words;
        }
    }

	public String getRelations() {
		return relations;
	}
	
	public static Map<String, Float> calculateMetrics(List<WordDTO> words) {

	    // Initialize the metrics map with Float
	    Map<String, Float> metrics = new HashMap<>();
	    metrics.put("combined", 0f); 
	    metrics.put("stemDifference", 0f);
	    metrics.put("levenshteinDistance", 0f); // Corrected spelling here
	    
	    int nouns = 0;
	    int wordsLength = words.size();
	    
	    float combined = 0f;
	    float stemDifference = 0f;
	    float levenshteinDistance = 0f;
	    
	    float percentageOfNouns = 0f;

	    // Process each WordDTO object in the list
	    for (WordDTO w : words) {   
	        // Check if the word is a noun
	        if(WordDTO.mapTags.getOrDefault(w.getTag(), 0) == 1) {
	            combined += w.getCombinedScore();
	            stemDifference += w.getStemDiff();
	            levenshteinDistance += w.getLevenshteinDistance();  // Corrected variable name
	            nouns++;
	        }
	    }
	    
	    if (nouns > 0) {
	        metrics.put("combined", combined / nouns);
	        metrics.put("stemDifference", stemDifference / nouns);
	        metrics.put("levenshteinDistance", levenshteinDistance / nouns);
	        percentageOfNouns = ((float) nouns / wordsLength) * 100;
	    }
	    
	    // Printing the results in a table format
	    System.out.println("========================================");
	    System.out.println("|          Metric         |    Value   |");
	    System.out.println("========================================");
	    System.out.printf("| %-23s | %-10.2f |\n", "Combined Score", metrics.get("combined"));
	    System.out.printf("| %-23s | %-10.2f |\n", "Stem Difference", metrics.get("stemDifference"));
	    System.out.printf("| %-23s | %-10.2f |\n", "Levenshtein Distance", metrics.get("levenshteinDistance"));
	    System.out.printf("| %-23s | %-10.2f |\n", "Percentage of Nouns", percentageOfNouns);
	    System.out.println("========================================");

	    return metrics;
	}


}
