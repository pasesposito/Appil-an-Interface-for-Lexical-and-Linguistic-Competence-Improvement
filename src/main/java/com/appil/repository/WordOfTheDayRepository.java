package com.appil.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.appil.entity.WordOfTheDay;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface WordOfTheDayRepository extends JpaRepository<WordOfTheDay, Long> {
    // Method to find a WordOfTheDay by date
    Optional<WordOfTheDay> findByDate(LocalDate date);
    
    Optional<WordOfTheDay> findByWord(String word); 
    
    
}