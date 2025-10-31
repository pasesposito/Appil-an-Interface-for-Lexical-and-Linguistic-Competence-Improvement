package com.appil.dto;

import java.time.LocalDate;

public class WordOfTheDayDTO {

    private Long idWordOfTheDay; // ID of the Word of the Day
    private String word;         // The word itself
    private LocalDate date;      // The date of the word
    private String graph;        // Graph details if applicable
    private String abs;          // Abstract or definition of the word
    private String labelIt;      // Italian label, if needed
    private String wikiPage;     // Link to the wiki page
    private String imgTitle;     // Title of the associated image

    // Getters and Setters
    public Long getIdWordOfTheDay() {
        return idWordOfTheDay;
    }

    public void setIdWordOfTheDay(Long idWordOfTheDay) {
        this.idWordOfTheDay = idWordOfTheDay;
    }

    public String getWord() {
        return word;
    }

    public void setWord(String word) {
        this.word = word;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getGraph() {
        return graph;
    }

    public void setGraph(String graph) {
        this.graph = graph;
    }

    public String getAbs() {
        return abs;
    }

    public void setAbs(String abs) {
        this.abs = abs;
    }

    public String getLabelIt() {
        return labelIt;
    }

    public void setLabelIt(String labelIt) {
        this.labelIt = labelIt;
    }

    public String getWikiPage() {
        return wikiPage;
    }

    public void setWikiPage(String wikiPage) {
        this.wikiPage = wikiPage;
    }

    public String getImgTitle() {
        return imgTitle;
    }

    public void setImgTitle(String imgTitle) {
        this.imgTitle = imgTitle;
    }
}
