package com.appil.functions;

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

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Component;

import com.appil.dto.ProcessedResponse;
import com.appil.service.LevelService;
import com.appil.service.NounEnhancementService;
import com.appil.service.SparqlService;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import net.sf.extjwnl.JWNLException;
import net.sf.extjwnl.data.IndexWord;
import net.sf.extjwnl.data.POS;
import net.sf.extjwnl.data.Synset;
import net.sf.extjwnl.dictionary.Dictionary;


public class Word {
		
		public Word() {
		super();
	}
	
	public Word(String word, String tag, String lemma, int sessionLevel, boolean entity, String sentence, LevelService levelService,
			NounEnhancementService nounEnhancementService,
			SparqlService sparqlService)
			throws JWNLException, NullPointerException, ClassNotFoundException, SQLException, IOException {
				
		this.form = word;
		this.tag = tag;
		this.lemma = lemma;
		this.entity = entity;

		if (mapTags.get(tag) != null
				&& (mapTags.get(tag) == 1 || mapTags.get(tag) == 2 || mapTags.get(tag) == 3 || mapTags.get(tag) == 4))
			fillSemRel(lemma, sentence);
		
		Integer levelNumber = levelService.getLevelNumberByWord(lemma);
		    if (levelNumber != null) {
		    	this.level =  levelNumber;
		    } else {
		        this.level = 11;
		    }
		    	

		if (mapTags.get(tag) != null && (this.level >= sessionLevel || this.level == 11 || this.level >= 4) && !entity) {

			this.toEnhance = true;

			if (mapTags.get(tag) == 1) {
				
				//enhanceNoun(lemma, nounEnhancementService, sparqlService);

			} else if (mapTags.get(tag) == 2) { // Verb
				enhanceVerb(lemma);
			}
		}
	}

	
	
		
	public static int sessionLevel = 0;

	public String form;
	public String lemma;
	public String tag;
	public String image = null;
	public String link = null;
	public String abs = "";
	public String easier = null;

	public int idNoun = -1;
	public Image imageInfo = null;

	public boolean entity = false;
	public int level = 0;
	public boolean toEnhance = false;

	public boolean punctuation = false;

	private JsonObject relationGraph;

	private List<String> synonyms = new ArrayList<>();
	private List<String> hypernyms = new ArrayList<>();
	private List<String> hyponyms = new ArrayList<>();
	private List<String> meronyms = new ArrayList<>();
	private List<String> holonyms = new ArrayList<>();
	private List<String> antonyms = new ArrayList<>();

	private String definition = "";

	public HashMap<String, Integer> leveledSynonyms;

	public List<Synset> synsets = null;
	public HashMap<Integer, HashMap<String, List<String>>> lexRel = new HashMap<>();

	public String wikiPage;

	String synsetHTML;

	public static HashMap<String, Integer> mapTags;

	static {
		mapTags = new HashMap<>();
		mapTags.put("JJ", 3);
		mapTags.put("JJR", 3);
		mapTags.put("JJS", 3);
		mapTags.put("V", 2);
		mapTags.put("VBZ", 2);
		mapTags.put("VBN", 2);
		mapTags.put("VB", 2);
		mapTags.put("VBD", 2);
		mapTags.put("VBP", 2);
		mapTags.put("N", 1);
		mapTags.put("NNS", 1);
		mapTags.put("NNP", 1);
		mapTags.put("NNPS", 1);
		mapTags.put("NN", 1);
		mapTags.put("RB", 4);
		mapTags.put("RBR", 4);
		mapTags.put("RBS", 4);
	}

	// Getters and Setters
	public String getForm() {
		return form;
	}

	public String getTag() {
		return tag;
	}

	public String getLemma() {
		return lemma;
	}

	public int getSessionLevel() {
		return sessionLevel;
	}

	public boolean isEntity() {
		return isEntity();
	}

	public String getLink() {
		return link;
	}

	public void setForm(String form) {
		this.form = form;
	}

	public void setTag(String tag) {
		this.tag = tag;
	}

	public void setLemma(String lemma) {
		this.lemma = lemma;
	}

	public void setSessionLevel(int sessionLevel) {
		this.sessionLevel = sessionLevel;
	}

	public void setEntity(boolean isEntity) {
		this.entity = isEntity;
	}

	public void setLink(String link) {
		this.link = link;
	}

	
//	private void enhanceNoun(String word, NounEnhancementService nounEnhancementService, SparqlService sparqlService) throws IOException {
//	    try {
//	        // Retrieve image information from the noun service
//	        Image info = nounEnhancementService.enhanceNoun(word);
//	        
//	        if (info.getLink() != null && !info.getLink().isEmpty()) {
//	            // Use the image info from the service if available
//	            this.imageInfo = info;
//	            this.link = info.getLink();
//	            this.abs = info.getDescription(); // Assuming description is the same as `abs`
//	            this.wikiPage = info.getLink(); // Assuming link is the same as wikiPage
//	            
//	        } else {
//	            // Fallback to Sparql search if no image info from the service
//	            String uppercaseForm = capitalizeFirstLetter(word);
//	            HashMap<String, String> resources = sparqlService.search(uppercaseForm);
//
//	            // Set values from Sparql search
//	            this.link = resources.getOrDefault("word", "Sorry, no enhancement");
//	            this.abs = resources.getOrDefault("absEn", "Sorry, no enhancement");
//	            this.wikiPage = resources.getOrDefault("wikiPage", "Sorry, no enhancement");
//
//	            // Initialize and set image info from Sparql search
//	            if (this.imageInfo == null) {
//	                this.imageInfo = new Image();
//	            }
//	            this.imageInfo.setLink(resources.getOrDefault("wikiImage", "Sorry, no enhancement"));
//	        }
//	    } catch (Exception e) {
//	        // Catch and handle any unexpected exceptions
//	        e.printStackTrace();
//	        System.out.println("Error occurred: " + e.getMessage());
//	        // Set default values in case of error
//	        this.link = "Sorry, no enhancement";
//	        this.abs = "Sorry, no enhancement";
//	        this.wikiPage = "Sorry, no enhancement";
//	        if (this.imageInfo == null) {
//	            this.imageInfo = new Image();
//	            this.imageInfo.setLink("Sorry, no enhancement");
//	        }
//	    }
//	}

	private String capitalizeFirstLetter(String word) {
	    if (word == null || word.isEmpty()) {
	        return word;
	    }
	    return word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase();
	}


	public Word(String punct, boolean punctuation) {

		this.form = punct;
		this.punctuation = punctuation;

	}

	

	private void enhanceVerb(String lemma) {
		try {
			Dictionary dictionary = Dictionary.getDefaultResourceInstance();
			IndexWord indexWord = dictionary.getIndexWord(POS.VERB, lemma);
			// Additional logic to process verbs
		} catch (Exception e) {
			// Handle possible exceptions here
		}
	}

	public boolean shouldLink() {
		return this.link != null && !this.link.isEmpty();
	}

	private static String getMainImageUrl(String url) throws IOException {
		if (url == null || url.isEmpty()) {
			throw new IllegalArgumentException("The 'url' parameter must not be empty.");
		}

		try {
			Document doc = Jsoup.connect(url).get();
			Element imageElement = doc.select(".infobox img").first(); // Adjust the selector as needed
			if (imageElement != null) {
				return "https:" + imageElement.attr("src");
			}
		} catch (IOException e) {
			// Handle specific exceptions related to Jsoup connection or document parsing
			throw new IOException("Error fetching image from URL: " + url, e);
		}

		return null; // Return null if no image element found
	}

	public List<String> fillSemRel(String lemma, String sentence) {

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
					parseSemRel(response.toString());
				}
			} else {
				System.out.println("Error: " + code);
			}

		} catch (Exception e) {
			e.printStackTrace();
		}
		return synonyms;
	}

	private void parseSemRel(String jsonResponse) {

		JsonObject jsonObject = JsonParser.parseString(jsonResponse).getAsJsonObject();

		// Parse synonyms
		if (jsonObject.has("synonyms")) {
			JsonArray jsonSynonyms = jsonObject.getAsJsonArray("synonyms");
			for (int i = 0; i < jsonSynonyms.size(); i++) {
				synonyms.add(jsonSynonyms.get(i).getAsString());
			}
		} else {

		}

		// Parse hypernyms
		if (jsonObject.has("hypernyms")) {
			JsonArray jsonHypernyms = jsonObject.getAsJsonArray("hypernyms");
			for (int i = 0; i < jsonHypernyms.size(); i++) {
				hypernyms.add(jsonHypernyms.get(i).getAsString());
			}
		} else {

		}

		// Parse hyponyms
		if (jsonObject.has("hyponyms")) {
			JsonArray jsonHyponyms = jsonObject.getAsJsonArray("hyponyms");
			for (int i = 0; i < jsonHyponyms.size(); i++) {
				hyponyms.add(jsonHyponyms.get(i).getAsString());
			}

		} else {

		}

		// Parse meronyms
		if (jsonObject.has("meronyms")) {
			JsonArray jsonMeronyms = jsonObject.getAsJsonArray("meronyms");
			for (int i = 0; i < jsonMeronyms.size(); i++) {
				meronyms.add(jsonMeronyms.get(i).getAsString());
			}
		} else {

		}

		// Parse holonyms
		if (jsonObject.has("holonyms")) {
			JsonArray jsonHolonyms = jsonObject.getAsJsonArray("holonyms");
			for (int i = 0; i < jsonHolonyms.size(); i++) {
				holonyms.add(jsonHolonyms.get(i).getAsString());
			}
		} else {

		}

		// Parse antonyms
		if (jsonObject.has("antonyms")) {
			JsonArray jsonAntonyms = jsonObject.getAsJsonArray("antonyms");
			for (int i = 0; i < jsonAntonyms.size(); i++) {
				antonyms.add(jsonAntonyms.get(i).getAsString());
			}
		} else {

		}

		if (jsonObject.has("relation_graph")) {

			JsonObject graphData = jsonObject.getAsJsonObject("relation_graph");
			this.relationGraph = graphData;
		} else {

		}

		if (jsonObject.has("definition")) {

			JsonElement definitionElement = jsonObject.get("definition");
			if (definitionElement.isJsonObject()) {
				this.definition = definitionElement.toString();
			} else {
				this.definition = definitionElement.getAsString();
			}
		} else {
			this.definition = "Definition not available";
		}
	}

	public List<String> getSynonyms() {
		return synonyms;
	}

	public List<String> getHypernyms() {
		return hypernyms;
	}

	public List<String> getHyponyms() {
		return hyponyms;
	}

	public List<String> getMeronyms() {
		return meronyms;
	}

	public List<String> getHolonyms() {
		return holonyms;
	}

	public List<String> getAntonyms() {
		return antonyms;
	}

	public String getDefinition() {
		return definition;
	}

	public void setSynonyms(List<String> synonyms) {
		this.synonyms = synonyms;
	}

	// Getter for relationGraph
	public JsonObject getRelationGraph() {
		return relationGraph;
	}

	public void printGraph() {
		if (relationGraph.has("words")) {
			JsonArray wordsArray = relationGraph.getAsJsonArray("words");
			// System.out.println("Nodes:");
			for (int i = 0; i < wordsArray.size(); i++) {
				JsonObject wordObject = wordsArray.get(i).getAsJsonObject();
				String id = wordObject.get("id").getAsString();
				String label = wordObject.get("label").getAsString();
				boolean isCore = wordObject.get("isCore").getAsBoolean();

				// System.out.println("ID: " + id + ", Label: " + label + ", Core: " + isCore);
			}
		}

		if (relationGraph.has("links")) {
			JsonArray linksArray = relationGraph.getAsJsonArray("links");
			// System.out.println("Relations:");
			for (int i = 0; i < linksArray.size(); i++) {
				JsonObject linkObject = linksArray.get(i).getAsJsonObject();
				String source = linkObject.get("source").getAsString();
				String target = linkObject.get("target").getAsString();
				String relation = linkObject.get("relation").getAsString();

				// System.out.println(source + " --[" + relation + "]--> " + target);
			}
		}
	}

	public static void main(String[] args) {

		Word word = new Word("office", false);
		String sentence = "The office is closed.";
		word.fillSemRel("office", sentence);

		// Print all semantic relations
		System.out.println("Word: " + word.getForm());
		System.out.println("Synonyms: " + word.getSynonyms());
		System.out.println("Hypernyms: " + word.getHypernyms());
		System.out.println("Hyponyms: " + word.getHyponyms());
		System.out.println("Meronyms: " + word.getMeronyms());
		System.out.println("Holonyms: " + word.getHolonyms());
		System.out.println("Antonyms: " + word.getAntonyms());
		word.printGraph();

	}

}
