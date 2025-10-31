package com.appil.dto;

public class CardDTO {
    private String text;
    private String image;
    private String wikiPage;

    public CardDTO(String text, String image, String wikiPage) {
        this.text = text;
        this.image = image;
        this.wikiPage = wikiPage;
    }

    // Getters and setters
    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getWikiPage() {
        return wikiPage;
    }

    public void setWikiPage(String wikiPage) {
        this.wikiPage = wikiPage;
    }
}
