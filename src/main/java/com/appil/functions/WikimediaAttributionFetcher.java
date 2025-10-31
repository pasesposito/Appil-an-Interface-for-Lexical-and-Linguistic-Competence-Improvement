package com.appil.functions;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.json.JSONObject;

import java.io.IOException;

public class WikimediaAttributionFetcher {

    public static void main(String[] args) {
        try {
            String imageUrl = "https://upload.wikimedia.org/wikipedia/commons/4/42/Example_image.jpg"; // Example URL
            WikimediaAttribution attribution = fetchWikimediaAttributionFromUrl(imageUrl);

            if (attribution != null) {
                // Use the attribution object as needed
                System.out.println("Title: " + attribution.getTitle());
                System.out.println("Artist: " + attribution.getArtist());
                System.out.println("License: " + attribution.getLicense());
                System.out.println("Attribution URL: " + attribution.getAttributionUrl());
                System.out.println("Description: " + attribution.getDescription());
                System.out.println("Credit: " + attribution.getCredit());
            } else {
                System.out.println("No attribution information found.");
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static WikimediaAttribution fetchWikimediaAttributionFromUrl(String imageUrl) throws IOException {
        // Extract filename from URL
        String filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1).split("\\?")[0];
        String apiUrl = "https://en.wikipedia.org/w/api.php?action=query&titles=File:" + filename + "&prop=imageinfo&iiprop=extmetadata&format=json&origin=*";

        // Initialize HTTP client
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpGet request = new HttpGet(apiUrl);
            try (CloseableHttpResponse response = httpClient.execute(request)) {
                HttpEntity entity = response.getEntity();
                String responseBody = EntityUtils.toString(entity);

                // Parse JSON response
                JSONObject json = new JSONObject(responseBody);
                JSONObject pages = json.getJSONObject("query").getJSONObject("pages");
                String pageId = pages.keys().next(); // Get the first key
                JSONObject imageInfo = pages.getJSONObject(pageId).getJSONArray("imageinfo").getJSONObject(0);

                if (imageInfo.has("extmetadata")) {
                    JSONObject metadata = imageInfo.getJSONObject("extmetadata");
                    String artist = metadata.optJSONObject("Artist") != null ? metadata.getJSONObject("Artist").optString("value", "Unknown") : "Unknown";
                    String license = metadata.optJSONObject("LicenseShortName") != null ? metadata.getJSONObject("LicenseShortName").optString("value", "Unknown") : "Unknown";
                    String attributionUrl = metadata.optJSONObject("AttributionRequired") != null ? metadata.getJSONObject("AttributionRequired").optString("value", imageUrl) : imageUrl;
                    String description = metadata.optJSONObject("ImageDescription") != null ? metadata.getJSONObject("ImageDescription").optString("value", "No description") : "No description";
                    String credit = metadata.optJSONObject("Credit") != null ? metadata.getJSONObject("Credit").optString("value", "No credit") : "No credit";
                    String title = metadata.optJSONObject("ObjectName") != null ? metadata.getJSONObject("ObjectName").optString("value", "No title") : "No title";

                    return new WikimediaAttribution(title, artist, license, attributionUrl, description, credit);
                } else {
                    return null;
                }
            }
        }
    }
}

class WikimediaAttribution {
    private final String title;
    private final String artist;
    private final String license;
    private final String attributionUrl;
    private final String description;
    private final String credit;

    public WikimediaAttribution(String title, String artist, String license, String attributionUrl, String description, String credit) {
        this.title = title;
        this.artist = artist;
        this.license = license;
        this.attributionUrl = attributionUrl;
        this.description = description;
        this.credit = credit;
    }

    public String getTitle() {
        return title;
    }

    public String getArtist() {
        return artist;
    }

    public String getLicense() {
        return license;
    }

    public String getAttributionUrl() {
        return attributionUrl;
    }

    public String getDescription() {
        return description;
    }

    public String getCredit() {
        return credit;
    }

    @Override
    public String toString() {
        return "Title: " + title + "\n" +
               "Artist: " + artist + "\n" +
               "License: " + license + "\n" +
               "Attribution URL: " + attributionUrl + "\n" +
               "Description: " + description + "\n" +
               "Credit: " + credit;
    }
}
