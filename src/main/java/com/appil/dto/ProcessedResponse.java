package com.appil.dto;

import java.util.List;
import java.util.Map;

public class ProcessedResponse {

    private String text;
    private String cards; // Expecting JSON string
    private String relations;
    private Map<String, String> abstracts;
    private List<WordDTO> words; // Jackson handles List<WordDTO> serialization by default

    // Getters and Setters
    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getCards() {
        return cards;
    }

    public void setCards(String cards) {
        this.cards = cards;
    }

    public String getRelations() {
        return relations;
    }

    public void setRelations(String relations) {
        this.relations = relations;
    }

    public Map<String, String> getAbstracts() {
        return abstracts;
    }

    public void setAbstracts(Map<String, String> abstracts) {
        this.abstracts = abstracts;
    }

    public List<WordDTO> getWords() {
        return words;
    }

    public void setWords(List<WordDTO> words) {
        this.words = words;
    }
}
