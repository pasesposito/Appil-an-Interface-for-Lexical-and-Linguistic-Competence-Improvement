package com.appil.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.appil.entity.Level;

@Repository
public interface LevelRepository extends JpaRepository<Level, Integer> {
    
    // Method to find a Level by the word field
    Level findByWord(String word);
    
    // Method to retrieve the level number by word
    @Query("SELECT l.level FROM Level l WHERE l.word = :word")
    Integer findLevelByWord(@Param("word") String word);
    
 
}
