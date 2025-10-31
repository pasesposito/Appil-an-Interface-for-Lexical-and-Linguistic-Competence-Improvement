package com.appil.service;

import com.appil.entity.Level;
import com.appil.repository.LevelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LevelService {

    @Autowired
    private LevelRepository levelRepository;

    // Method to get all Levels
    public List<Level> getAllLevels() {
        return levelRepository.findAll();
    }

    // Method to get a Level by its ID
    public Optional<Level> getLevelById(int idLevel) {
        return levelRepository.findById(idLevel);
    }

    // Method to save or update a Level
    public Level saveOrUpdateLevel(Level level) {
        return levelRepository.save(level);
    }

    // Method to delete a Level by its ID
    public void deleteLevel(int idLevel) {
        levelRepository.deleteById(idLevel);
    }

    public Optional<Level> getLevelByWord(String word) {
        return Optional.ofNullable(levelRepository.findByWord(word));
    }
    
    public Integer getLevelNumberByWord(String word) {
    	
    	Integer level = levelRepository.findLevelByWord(word);
    	
    		if (level != null)
    			return level ;
    		else
    			return 11;
    }
}
