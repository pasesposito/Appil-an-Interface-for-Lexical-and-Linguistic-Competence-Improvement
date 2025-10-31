package com.appil.service;

import com.appil.dto.WordDTO;
import com.appil.dto.WordImageDTO;
import com.appil.entity.Noun;
import com.appil.repository.NounRepository;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import org.json.JSONObject;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import net.sf.extjwnl.JWNLException;
import net.sf.extjwnl.data.IndexWord;
import net.sf.extjwnl.data.POS;
import net.sf.extjwnl.data.Synset;
import net.sf.extjwnl.dictionary.Dictionary;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@Service
public class WordService {

	@Autowired
	NounRepository nounRepository;

	public static int sessionLevel = 0;

	@Autowired
	private NounIdsService nounIdsService;

	public void enhanceNoun(String sentence, WordDTO wordDTO, NounEnhancementService nounEnhancementService,
			SparqlService sparqlService) throws IOException {

		try {

			if (nounRepository.existsByWord(wordDTO.getLemma())) {

				Optional<Noun> existingNoun = nounRepository.findByWord(wordDTO.getLemma());
				existingNoun.ifPresent(noun -> {
					nounIdsService.addNounId(noun.getIdNoun());
					wordDTO.setAbs(noun.getAbs());
					wordDTO.setIdNoun(noun.getIdNoun());
					wordDTO.setImage(noun.getImg());
					
					wordDTO.setLabelIt(noun.getLabelIt());
					
					if(noun.getLevhensteinDistance() != null)
					wordDTO.setLevenshteinDistance(noun.getLevhensteinDistance());
					
					if(noun.getCombinedScore() != null)
					wordDTO.setCombinedScore(noun.getCombinedScore());
					
					if(noun.getStemDiff() != null)
					wordDTO.setStemDiff(noun.getStemDiff());
						

				});

				// Retrieve image information from the noun service
				WordImageDTO info = nounEnhancementService.enhanceNoun(wordDTO.getLemma());

				if (info.getLink() != null && !info.getLink().isEmpty()) {
					// Use the image info from the service if available
					wordDTO.setImageInfo(info);
					wordDTO.setLink(info.getLink());
					wordDTO.setWikiPage(info.getLink());

				}
			} else {
				// Fallback to Sparql search if no image info from the service
				String uppercaseForm = capitalizeFirstLetter(wordDTO.getLemma());
				HashMap<String, String> resources = sparqlService.search(uppercaseForm);

				// Set values from Sparql search
				wordDTO.setLink(resources.getOrDefault("word", "Sorry, no enhancement"));
				wordDTO.setAbs(resources.getOrDefault("absEn", "Sorry, no enhancement"));
				wordDTO.setWikiPage(resources.getOrDefault("wikiPage", "Sorry, no enhancement"));

				// Initialize and set image info from Sparql search
				if (wordDTO.getImageInfo() == null) {
					wordDTO.setImageInfo(new WordImageDTO());
				}

				WordImageDTO imageInfo = wordDTO.getImageInfo();
				imageInfo.setLink(resources.getOrDefault("wikiImage", "Sorry, no enhancement"));
				imageInfo.setTitle(resources.getOrDefault("title", "No title"));
				imageInfo.setAuthor(resources.getOrDefault("author", "Unknown"));
				imageInfo.setLicense(resources.getOrDefault("license", "Unknown"));
				imageInfo.setCredit(resources.getOrDefault("credit", "No credit"));
				imageInfo.setDescription(resources.getOrDefault("description", "No description"));

				Noun noun = new Noun();
				noun.setWord(wordDTO.getForm()); // Mapping 'word' to noun
				noun.setImg(imageInfo.getLink()); // Assuming this is the image URL
				noun.setImgCredit(imageInfo.getCredit());
				noun.setImgAuthor(imageInfo.getAuthor());
				noun.setImgDescription(imageInfo.getDescription());
				noun.setImgLicense(imageInfo.getLicense());
				noun.setAbs(wordDTO.getAbs()); // Assuming 'abs' corresponds to the abstract text
				String itLabel = removeLanguageAnnotations(resources.getOrDefault("labelIt", null));
				noun.setLabelIt(itLabel); // Remove @it
				noun.setWikiPage(wordDTO.getWikiPage()); // Wikipedia page URL
				noun.setAbsIt(removeLanguageAnnotations(resources.getOrDefault("absIt", null))); // Remove @it
				noun.setImgTitle(imageInfo.getTitle()); // Title of the image
				noun.setLevel(wordDTO.getLevel()); // Setting level information

				if (itLabel != null) {
					noun.setStemDiff(getSimilarityResponse(wordDTO.getForm(), itLabel));
					noun.setLevhensteinDistance(getLevenshteinResponse(wordDTO.getForm(), itLabel));
				}

				Noun savedNoun = nounRepository.save(noun);

				// Add the ID of the saved noun to the list
				nounIdsService.addNounId(savedNoun.getIdNoun());
			}

		} catch (Exception e) {
			// Catch and handle any unexpected exceptions
			e.printStackTrace();
			System.out.println("Error occurred: " + e.getMessage());
			// Set default values in case of error
			wordDTO.setLink("Sorry, no enhancement");
			wordDTO.setAbs("Sorry, no enhancement");
			wordDTO.setWikiPage("Sorry, no enhancement");
		}

		try {
			fillSemRel(wordDTO, wordDTO.getLemma(), sentence);
		} catch (Exception e) {
			e.printStackTrace();
			System.out.println("Error occurred: " + e.getMessage());
		}

	}

	public void fillSemRel(WordDTO wordDTO, String lemma, String sentence) {
		try {
			URL url = new URL("http://localhost:5005/disambiguate");
			HttpURLConnection conn = (HttpURLConnection) url.openConnection();
			conn.setRequestMethod("POST");
			conn.setRequestProperty("Content-Type", "application/json");
			conn.setDoOutput(true);

			String jsonInputString = "{\"sentence\": \"" + sentence + "\", \"word\": \"" + lemma + "\"}";

			try (OutputStream os = conn.getOutputStream()) {
				byte[] input = jsonInputString.getBytes("utf-8");
				os.write(input, 0, input.length);
			}

			int code = conn.getResponseCode();
			if (code == 200) {
				try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"))) {
					StringBuilder response = new StringBuilder();
					String responseLine;
					while ((responseLine = br.readLine()) != null) {
						response.append(responseLine.trim());
					}
					parseSemRel(wordDTO, response.toString());
				}
			} else {
				try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getErrorStream(), "utf-8"))) {
					StringBuilder errorResponse = new StringBuilder();
					String errorLine;
					while ((errorLine = br.readLine()) != null) {
						errorResponse.append(errorLine.trim());
					}
					System.err.println("Error " + code + ": " + errorResponse.toString());
				}
			}

		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private void parseSemRel(WordDTO wordDTO, String jsonResponse) {

		JsonObject jsonObject = JsonParser.parseString(jsonResponse).getAsJsonObject();

		// Parse synonyms
		parseJsonArray(jsonObject, "synonyms", wordDTO.getSynonyms());

		// Parse hypernyms
		parseJsonArray(jsonObject, "hypernyms", wordDTO.getHypernyms());

		// Parse hyponyms
		parseJsonArray(jsonObject, "hyponyms", wordDTO.getHyponyms());

		// Parse meronyms
		parseJsonArray(jsonObject, "meronyms", wordDTO.getMeronyms());

		// Parse holonyms
		parseJsonArray(jsonObject, "holonyms", wordDTO.getHolonyms());

		// Parse antonyms
		parseJsonArray(jsonObject, "antonyms", wordDTO.getAntonyms());

		// Parse relation graph
		if (jsonObject.has("relation_graph")) {
			JsonElement relationGraphElement = jsonObject.get("relation_graph");
			if (relationGraphElement.isJsonObject()) {
				wordDTO.setRelationGraph(relationGraphElement.toString());
			} else {
				// Handle other types or set a default value
				wordDTO.setRelationGraph(relationGraphElement.getAsString());
			}
		}

		// Parse definition
		if (jsonObject.has("definition")) {
			JsonElement definitionElement = jsonObject.get("definition");
			wordDTO.setDefinition(
					definitionElement.isJsonObject() ? definitionElement.toString() : definitionElement.getAsString());
		} else {
			wordDTO.setDefinition("Definition not available");
		}
	}

	/**
	 * Utility method to parse a JSON array and add its elements to a list.
	 * 
	 * @param jsonObject The JSON object containing the array.
	 * @param key        The key for the array in the JSON object.
	 * @param list       The list to populate with elements from the JSON array.
	 */
	private void parseJsonArray(JsonObject jsonObject, String key, List<String> list) {

		JsonArray jsonArray = jsonObject.getAsJsonArray(key);
		// Debugging: Print the contents of the JSON array
		if (jsonArray != null) {
			for (JsonElement element : jsonArray) {
				String value = element.getAsString();
				// Debugging: Print each value being added

				list.add(value);
			}
		}
	}

	public String capitalizeFirstLetter(String input) {
		if (input == null || input.isEmpty()) {
			return input;
		}
		return input.substring(0, 1).toUpperCase() + input.substring(1);
	}

	// Method to remove @en and @it from strings
	private String removeLanguageAnnotations(String value) {

		if (value != null)
			return value.replaceAll("@en", "").replaceAll("@it", "").trim();

		else
			return null;
	}

	private float getSimilarityResponse(String word1, String word2) throws IOException {
		// Define the URL of the Python similarity endpoint
		URL url = new URL("http://localhost:5005/similarity");
		HttpURLConnection conn = (HttpURLConnection) url.openConnection();
		conn.setRequestMethod("POST");
		conn.setRequestProperty("Content-Type", "application/json");
		conn.setDoOutput(true);

		// Create a JSON input string with the two words
		String jsonInputString = String.format("{\"word1\": \"%s\", \"word2\": \"%s\"}", word1, word2);

		// Send the request
		try (OutputStream os = conn.getOutputStream()) {
			byte[] input = jsonInputString.getBytes("utf-8");
			os.write(input, 0, input.length);
		}

		// Read the response
		try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"))) {
			StringBuilder response = new StringBuilder();
			String responseLine;
			while ((responseLine = br.readLine()) != null) {
				response.append(responseLine.trim());
			}

			// Parse the JSON response to get the stem difference
			JSONObject jsonResponse = new JSONObject(response.toString());
			return (float) jsonResponse.getDouble("stem_diff"); // Return as float
		}
	}

	private int getLevenshteinResponse(String word1, String word2) throws IOException {
		// Define the URL of the Python Levenshtein distance endpoint
		URL url = new URL("http://localhost:5005/levenshtein");
		HttpURLConnection conn = (HttpURLConnection) url.openConnection();
		conn.setRequestMethod("POST");
		conn.setRequestProperty("Content-Type", "application/json");
		conn.setDoOutput(true);

		// Create a JSON input string with the two words
		String jsonInputString = String.format("{\"word1\": \"%s\", \"word2\": \"%s\"}", word1, word2);

		// Send the request
		try (OutputStream os = conn.getOutputStream()) {
			byte[] input = jsonInputString.getBytes("utf-8");
			os.write(input, 0, input.length);
		}

		// Read the response
		try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"))) {
			StringBuilder response = new StringBuilder();
			String responseLine;
			while ((responseLine = br.readLine()) != null) {
				response.append(responseLine.trim());
			}

			// Parse the JSON response to get the Levenshtein distance
			JSONObject jsonResponse = new JSONObject(response.toString());
			return jsonResponse.getInt("distance"); // Return as int
		}
	}

}
