package com.appil.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "word_of_the_day") // Specify the table name for this entity
public class WordOfTheDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idWordOfTheDay")
    private Long idWordOfTheDay;

    @Column(name = "word", length = 100, nullable = false) // Assuming word should not be null
    private String word;

    @Column(name = "date", nullable = false) // New date field
    private LocalDate date;
    
    @Column(name = "graph", columnDefinition = "TEXT", nullable = true)
    private String graph;
    
    @Column(name = "definitions", columnDefinition = "TEXT", nullable = true)
    private String definitions;
    
    @Column(name = "abs", columnDefinition = "TEXT")
    private String abs;

    @Column(name = "labelIt", columnDefinition = "TEXT")
    private String labelIt;

    @Column(name = "wikiPage", columnDefinition = "TEXT")
    private String wikiPage;

    @Column(name = "imgTitle", columnDefinition = "TEXT")
    private String imgTitle;

   

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

	public String getDefinitions() {
		return definitions;
	}

	public void setDefinitions(String definitions) {
		this.definitions = definitions;
	}
}
