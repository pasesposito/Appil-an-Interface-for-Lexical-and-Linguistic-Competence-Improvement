package com.appil.service;

import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.apache.jena.query.*;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import com.appil.dto.WordImageDTO;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.List;

@Service
public class SparqlService {

    private static final String SPARQL_ENDPOINT_URL = "http://dbpedia.org/sparql";
    private static final int THUMBNAIL_SIZE = 500;
    
    public static void main (String [] args) {
    	
    	SparqlService ss = new SparqlService();
    	
    	
    	System.out.println(ss.search("painting"));
    	
    }

    public HashMap<String, String> search(String word) {
        String uppercaseForm = capitalizeFirstLetter(word.toLowerCase());
        HashMap<String, String> resources = new HashMap<>();

        String queryString =
                "PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>\n" +
                "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
                "PREFIX dbo: <http://dbpedia.org/ontology/>\n" +
                "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n" +
                "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
                "SELECT ?word ?img ?labelEn ?labelIt ?absEn ?absIt ?wikiPage WHERE {\n" +
                "  ?word rdfs:label \"" + uppercaseForm + "\"@en .\n" +
                "  OPTIONAL { ?word dbpedia-owl:thumbnail ?img . }\n" +
                "  OPTIONAL { ?word foaf:isPrimaryTopicOf ?wikiPage . }\n" +
                "  OPTIONAL { ?word dbo:abstract ?absEn . FILTER(LANG(?absEn) = \"en\") }\n" +
                "  OPTIONAL { ?word dbo:abstract ?absIt . FILTER(LANG(?absIt) = \"it\") }\n" +
                "  OPTIONAL { ?word rdfs:label ?labelEn . FILTER(LANG(?labelEn) = \"en\") }\n" +
                "  OPTIONAL { ?word rdfs:label ?labelIt . FILTER(LANG(?labelIt) = \"it\") }\n" +
                "  FILTER (STRSTARTS(STR(?word), 'http://dbpedia.org/resource/') ||\n" +
                "          STRSTARTS(STR(?word), 'http://dbpedia.org/page/'))\n" +
                "}\n" +
                "LIMIT 1";

        try (QueryExecution exec = QueryExecutionFactory.sparqlService(SPARQL_ENDPOINT_URL, queryString)) {
            ResultSet results = exec.execSelect();
            List<String> vars = results.getResultVars();

            if (results.hasNext()) {
                QuerySolution result = results.next();
                for (String v : vars) {
                    if (result.get(v) != null) {
                        resources.put(v, result.get(v).toString());
                    }
                }

                String mainImageUrl = getMainImageUrl(resources.get("wikiPage"));
                if (resources.get("wikiPage") != null) {
                    resources.put("wikiImage", mainImageUrl);
                } else {
                    resources.put("wikiImage", "");
                }
                
                if(mainImageUrl != null) {
                // Fetch Wikimedia attribution data and merge it into the resources map
                HashMap<String, String> attributionData = fetchWikimediaAttributionFromUrl(mainImageUrl);
                resources.putAll(attributionData);
                
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return resources;
    }


    private static String capitalizeFirstLetter(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }
        return input.substring(0, 1).toUpperCase() + input.substring(1);
    }

    private String getMainImageUrl(String articleUrl) throws IOException {
        String title = articleUrl.substring(articleUrl.lastIndexOf("/") + 1);
        String apiUrl = "https://en.wikipedia.org/w/api.php?action=query&titles=" + title +
                        "&prop=pageimages&format=json&pithumbsize=" + THUMBNAIL_SIZE;

        URL url = new URL(apiUrl);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");

        StringBuilder content = new StringBuilder();
        try (BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()))) {
            String inputLine;
            while ((inputLine = in.readLine()) != null) {
                content.append(inputLine);
            }
        }

        connection.disconnect();

        JSONObject jsonResponse = new JSONObject(content.toString());
        JSONObject pages = jsonResponse.getJSONObject("query").getJSONObject("pages");
        String pageId = pages.keys().next();
        JSONObject page = pages.getJSONObject(pageId);

        if (page.has("thumbnail")) {
            return page.getJSONObject("thumbnail").getString("source");
        }

        return null;
    }
    
    
    public static HashMap<String, String> fetchWikimediaAttributionFromUrl(String imageUrl) {
        HashMap<String, String> metadataMap = new HashMap<>();

        // Extract filename from URL
        String filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1).split("\\?")[0];
        String apiUrl = "https://en.wikipedia.org/w/api.php?action=query&titles=File:" + filename + "&prop=imageinfo&iiprop=extmetadata&format=json&origin=*";

        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpGet request = new HttpGet(apiUrl);
            try (CloseableHttpResponse response = httpClient.execute(request)) {
                HttpEntity entity = response.getEntity();
                String responseBody = EntityUtils.toString(entity);

                // Parse JSON response
                JSONObject json = new JSONObject(responseBody);
                JSONObject pages = json.getJSONObject("query").getJSONObject("pages");
                String pageId = pages.keys().next(); // Get the first key

                // Ensure 'imageinfo' key exists and handle missing data
                if (pages.getJSONObject(pageId).has("imageinfo")) {
                    JSONObject imageInfo = pages.getJSONObject(pageId).getJSONArray("imageinfo").getJSONObject(0);

                    if (imageInfo.has("extmetadata")) {
                        JSONObject metadata = imageInfo.getJSONObject("extmetadata");

                        // Safely extract values and put them in the map
                        metadataMap.put("title", metadata.optJSONObject("ObjectName") != null ? metadata.getJSONObject("ObjectName").optString("value", "No title") : "No title");
                        metadataMap.put("author", metadata.optJSONObject("Artist") != null ? metadata.getJSONObject("Artist").optString("value", "Unknown") : "Unknown");
                        metadataMap.put("license", metadata.optJSONObject("LicenseShortName") != null ? metadata.getJSONObject("LicenseShortName").optString("value", "Unknown") : "Unknown");
                        metadataMap.put("attributionUrl", metadata.optJSONObject("AttributionRequired") != null ? metadata.getJSONObject("AttributionRequired").optString("value", imageUrl) : imageUrl);
                        metadataMap.put("description", metadata.optJSONObject("ImageDescription") != null ? metadata.getJSONObject("ImageDescription").optString("value", "No description") : "No description");
                        metadataMap.put("credit", metadata.optJSONObject("Credit") != null ? metadata.getJSONObject("Credit").optString("value", "No credit") : "No credit");
                    }
                }
            }
        } catch (IOException e) {
            // Handle IOExceptions related to HTTP requests or network issues
            System.err.println("IOException occurred: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            // Handle any other exceptions that may occur
            System.err.println("An unexpected error occurred: " + e.getMessage());
            e.printStackTrace();
        }

        return metadataMap;
    }
}
