package com.appil.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "level") // Updated to match your table name, which is now "level" 
public class Level {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_level", nullable = false) // Changed to match your database column names
    private int idLevel;

    @Column(name = "word", length = 100, nullable = true) // Updated to match your database column names
    private String word;

    @Column(name = "level", nullable = true) // Updated to match your database column names
    private Integer level;

    @Column(name = "lev", nullable = true) // Assuming 'lev' is the new field to be included
    private Integer lev;

    @Column(name = "stem_diff", nullable = true) // Assuming 'stem_diff' is the new field to be included
    private Float stemDiff;

    @Column(name = "label_it", length = 100, nullable = true) // Assuming 'label_it' is the new field to be included
    private String labelIt;

    // Getters and Setters

    public int getIdLevel() {
        return idLevel;
    }

    public void setIdLevel(int idLevel) {
        this.idLevel = idLevel;
    }

    public String getWord() {
        return word;
    }

    public void setWord(String word) {
        this.word = word;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public Integer getLev() {
        return lev; // Getter for 'lev'
    }

    public void setLev(Integer lev) {
        this.lev = lev; // Setter for 'lev'
    }

    public Float getStemDiff() {
        return stemDiff; // Getter for 'stem_diff'
    }

    public void setStemDiff(Float stemDiff) {
        this.stemDiff = stemDiff; // Setter for 'stem_diff'
    }

    public String getLabelIt() {
        return labelIt; // Getter for 'label_it'
    }

    public void setLabelIt(String labelIt) {
        this.labelIt = labelIt; // Setter for 'label_it'
    }
}


//package com.appil.entity;
//
//import jakarta.persistence.Column;
//import jakarta.persistence.Entity;
//import jakarta.persistence.GeneratedValue;
//import jakarta.persistence.GenerationType;
//import jakarta.persistence.Id;
//import jakarta.persistence.Table;
//
//@Entity
//@Table(name = "levels")
//
//public class Level {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    @Column(name = "IdLevel", nullable = false)
//    private int idLevel;
//
//    @Column(name = "Counter", nullable = true)
//    private Integer counter;
//
//    @Column(name = "Word", length = 100, nullable = true)
//    private String word;
//
//    @Column(name = "Level", nullable = true)
//    private Integer level;
//
//    @Column(name = "Weigth", nullable = true)
//    private Float weight;
//
//    @Column(name = "Synset", length = 45, nullable = true)
//    private String synset;
//
//    @Column(name = "SynsetId", length = 45, nullable = true)
//    private String synsetId;
//
//    // Getters and Setters
//
//    public int getIdLevel() {
//        return idLevel;
//    }
//
//    public void setIdLevel(int idLevel) {
//        this.idLevel = idLevel;
//    }
//
//    public Integer getCounter() {
//        return counter;
//    }
//
//    public void setCounter(Integer counter) {
//        this.counter = counter;
//    }
//
//    public String getWord() {
//        return word;
//    }
//
//    public void setWord(String word) {
//        this.word = word;
//    }
//
//    public Integer getLevel() {
//        return level;
//    }
//
//    public void setLevel(Integer level) {
//        this.level = level;
//    }
//
//    public Float getWeight() {
//        return weight;
//    }
//
//    public void setWeight(Float weight) {
//        this.weight = weight;
//    }
//
//    public String getSynset() {
//        return synset;
//    }
//
//    public void setSynset(String synset) {
//        this.synset = synset;
//    }
//
//    public String getSynsetId() {
//        return synsetId;
//    }
//
//    public void setSynsetId(String synsetId) {
//        this.synsetId = synsetId;
//    }
//}
