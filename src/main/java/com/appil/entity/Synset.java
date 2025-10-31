package com.appil.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "synset") // Ensure this matches your actual table name
public class Synset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_synset", nullable = false)
    private int idSynset;

    @Column(name = "synset", length = 255, unique = true, nullable = true)
    private String synset;

    @Column(name = "definition", nullable = true)
    private String definition;

    // Getters and Setters

    public int getIdSynset() {
        return idSynset;
    }

    public void setIdSynset(int idSynset) {
        this.idSynset = idSynset;
    }

    public String getSynset() {
        return synset;
    }

    public void setSynset(String synset) {
        this.synset = synset;
    }

    public String getDefinition() {
        return definition;
    }

    public void setDefinition(String definition) {
        this.definition = definition;
    }
}
