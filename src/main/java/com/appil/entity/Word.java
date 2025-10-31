package com.appil.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "word") // Replace with your actual table name
public class Word {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idWord;

    
    private Long user;

  
    private String word;

    
    private Long counterLike;

    
    private Long counterDislike;

   
    private LocalDateTime lastTimeLiked;

   
    private LocalDateTime lastTimeDisliked;

    // Getters and Setters
    public Long getIdWord() {
        return idWord;
    }

    public void setIdWord(Long idWord) {
        this.idWord = idWord;
    }

    public Long getUser() {
        return user;
    }

    public void setUser(Long userId) {
        this.user = userId;
    }

    public String getWord() {
        return word;
    }

    public void setWord(String word) {
        this.word = word;
    }

    public Long getCounterLike() {
        return counterLike;
    }

    public void setCounterLike(Long counterLike) {
        this.counterLike = counterLike;
    }

    public Long getCounterDislike() {
        return counterDislike;
    }

    public void setCounterDislike(Long counterDislike) {
        this.counterDislike = counterDislike;
    }

    public LocalDateTime getLastTimeLiked() {
        return lastTimeLiked;
    }

    public void setLastTimeLiked(LocalDateTime lastTimeLiked) {
        this.lastTimeLiked = lastTimeLiked;
    }

    public LocalDateTime getLastTimeDisliked() {
        return lastTimeDisliked;
    }

    public void setLastTimeDisliked(LocalDateTime lastTimeDisliked) {
        this.lastTimeDisliked = lastTimeDisliked;
    }
}
