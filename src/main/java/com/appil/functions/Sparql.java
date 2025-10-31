package com.appil.functions;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;

import org.apache.jena.query.* ;

import org.json.JSONObject;


public class Sparql {
	
	private static final int THUMBNAIL_SIZE = 500;
	

		
	public static HashMap<String, String> search (String word, String entity) {
			
			String uppercaseForm = word.substring(0,1).toUpperCase() + word.substring(1);
			HashMap<String, String> resources = new HashMap<String,String>();
			String abs = "";
			
	        String queryString = 
	            "PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>\n" +
	            "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +         "PREFIX dbo: <http://dbpedia.org/ontology/>\n" +
	            "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n" + // Added foaf prefix
	            "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
	            "\n" +
	            "SELECT ?word ?img ?labelEn ?labelIt ?absEn ?absIt ?wikiPage WHERE {\n" + // Added ?wikiPage
	            "  ?word rdfs:label \"" + uppercaseForm + "\"@en .\n" + 
	            "  ?word dbpedia-owl:thumbnail ?img .\n" +
	            "  ?word foaf:isPrimaryTopicOf ?wikiPage . \n" + // Get the wikiPage
	            "  OPTIONAL { ?word dbo:abstract ?absEn . FILTER(LANG(?absEn) = \"en\") }\n" +
	            "  OPTIONAL { ?word dbo:abstract ?absIt . FILTER(LANG(?absIt) = \"it\") }\n" +
	            "  OPTIONAL { ?word rdfs:label ?labelEn . FILTER(LANG(?labelEn) = \"en\") }\n" +
	            "  OPTIONAL { ?word rdfs:label ?labelIt . FILTER(LANG(?labelIt) = \"it\") }\n" +
	            "  FILTER (STRSTARTS(STR(?word), 'http://dbpedia.org/resource/') ||\n" +
	            "          STRSTARTS(STR(?word), 'http://dbpedia.org/page/'))\n" +
	            "}\n" +
	            "LIMIT 1";

				  
			ParameterizedSparqlString qs = new ParameterizedSparqlString (queryString);

			  
		  
		  QueryExecution exec = QueryExecutionFactory.sparqlService("http://dbpedia.org/sparql", qs.asQuery());

	        ResultSet results = exec.execSelect();
	        
	        List<String> vars = results.getResultVars();
	    	        
	        while(results.hasNext()) {
	        	
	        	QuerySolution result = results.next();
	        	
	        	for(String v : vars) {
	        	
		        	if(result.get(v) != null)
		        		resources.put(v, result.get(v).toString());
		        				        	
		        	else 
		        		continue;
	        	
	        	}
	        
	        }
	        
	        //System.out.println(resources);
	        return resources;	            
	      
	}
	
	
	

	public static HashMap<String, String> search(String word) {
		
        String uppercaseForm = word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase();
        HashMap<String, String> resources = new HashMap<>();
        
        String queryString = 
	            "PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>\n" +
	            "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +         "PREFIX dbo: <http://dbpedia.org/ontology/>\n" +
	            "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n" + // Added foaf prefix
	            "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
	            "\n" +
	            "SELECT ?word ?img ?labelEn ?labelIt ?absEn ?absIt ?wikiPage WHERE {\n" + // Added ?wikiPage
	            "  ?word rdfs:label \"" + uppercaseForm + "\"@en .\n" + 
	            "  ?word dbpedia-owl:thumbnail ?img .\n" +
	            "  ?word foaf:isPrimaryTopicOf ?wikiPage . \n" + // Get the wikiPage
	            "  OPTIONAL { ?word dbo:abstract ?absEn . FILTER(LANG(?absEn) = \"en\") }\n" +
	            "  OPTIONAL { ?word dbo:abstract ?absIt . FILTER(LANG(?absIt) = \"it\") }\n" +
	            "  OPTIONAL { ?word rdfs:label ?labelEn . FILTER(LANG(?labelEn) = \"en\") }\n" +
	            "  OPTIONAL { ?word rdfs:label ?labelIt . FILTER(LANG(?labelIt) = \"it\") }\n" +
	            "  FILTER (STRSTARTS(STR(?word), 'http://dbpedia.org/resource/') ||\n" +
	            "          STRSTARTS(STR(?word), 'http://dbpedia.org/page/'))\n" +
	            "}\n" +
	            "LIMIT 1";

				  
			ParameterizedSparqlString qs = new ParameterizedSparqlString (queryString);

			  

        try (QueryExecution exec = QueryExecutionFactory.sparqlService("http://dbpedia.org/sparql", qs.asQuery())) {
            ResultSet results = exec.execSelect();
            List<String> vars = results.getResultVars();
            
                        
            if (results.hasNext()) {
            	
                QuerySolution result = results.next();
                
                for (String v : vars) {
                	
                    if (result.get(v) != null) {
                    	
                        resources.put(v, result.get(v).toString());
                       
                    }
                }
            }
            
            if (resources.get("wikiPage") != null)
            resources.put("wikiImage", getMainImageUrl(resources.get("wikiPage")));
            else
            resources.put("wikiImage", "");
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        
        return resources;
    }
	


	    private static String getMainImageUrl(String articleUrl) throws IOException {
	        // Extract the title from the URL
	        String title = articleUrl.substring(articleUrl.lastIndexOf("/") + 1);

	        // Construct the API URL
	        String apiUrl = "https://en.wikipedia.org/w/api.php?action=query&titles=" + title +
	                        "&prop=pageimages&format=json&pithumbsize=" + THUMBNAIL_SIZE;

	        // Make the HTTP request
	        URL url = new URL(apiUrl);
	        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
	        connection.setRequestMethod("GET");

	        BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
	        String inputLine;
	        StringBuilder content = new StringBuilder();
	        while ((inputLine = in.readLine()) != null) {
	            content.append(inputLine);
	        }

	        in.close();
	        connection.disconnect();

	        // Parse the JSON response
	        JSONObject jsonResponse = new JSONObject(content.toString());
	        JSONObject pages = jsonResponse.getJSONObject("query").getJSONObject("pages");
	        String pageId = pages.keys().next();
	        JSONObject page = pages.getJSONObject(pageId);

	        if (page.has("thumbnail")) {
	            return page.getJSONObject("thumbnail").getString("source");
	        }

	        return null;
	    }
	    
}

