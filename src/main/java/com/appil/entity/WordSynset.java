package com.appil.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "word_synset") // Adjust table name according to your naming convention
public class WordSynset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_word_synset", nullable = false)
    private int idWordSynset;

    @Column(name = "word", length = 100, nullable = true)
    private String word;

    @Column(name = "id_synset", nullable = true)
    private Integer idSynset;

    @Column(name = "sense_number", nullable = true)
    private Integer senseNumber;

    // Getters and Setters

    public int getIdWordSynset() {
        return idWordSynset;
    }

    public void setIdWordSynset(int idWordSynset) {
        this.idWordSynset = idWordSynset;
    }

    public String getWord() {
        return word;
    }

    public void setWord(String word) {
        this.word = word;
    }

    public Integer getIdSynset() {
        return idSynset;
    }

    public void setIdSynset(Integer idSynset) {
        this.idSynset = idSynset;
    }

    public Integer getSenseNumber() {
        return senseNumber;
    }

    public void setSenseNumber(Integer senseNumber) {
        this.senseNumber = senseNumber;
    }
}
