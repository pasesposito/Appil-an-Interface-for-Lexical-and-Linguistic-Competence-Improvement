package com.appil.functions;

import com.google.gson.Gson;

public class Image {
	
	public String text = null;
    private String link = null; 
    private String title = null;
    private String wikiPage = null;
    private String author = null;
    private String license = null;
    private String credit = null;
    private String description = null;
    
    
    public Image() {
    	
    	this.text = "";
    	this.link = "";
    	this.title = "";
    	this.wikiPage = "";
    	this.author = "";
    	this.license = "";
    	this.credit = "";
    	this.description = "";
    	
    }
    
 // Method to convert the object to JSON
    public String toJson() {
        Gson gson = new Gson();
        return gson.toJson(this);
    }
    
    
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    // Getter and Setter for link
    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    // Getter and Setter for wikiPage
    public String getWikiPage() {
        return wikiPage;
    }

    public void setWikiPage(String wikiPage) {
        this.wikiPage = wikiPage;
    }

    // Getter and Setter for author
    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    // Getter and Setter for license
    public String getLicense() {
        return license;
    }

    public void setLicense(String license) {
        this.license = license;
    }

    // Getter and Setter for credit
    public String getCredit() {
        return credit;
    }

    public void setCredit(String credit) {
        this.credit = credit;
    }

    // Getter and Setter for description
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
