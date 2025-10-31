package com.appil.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.appil.entity.Word;

import jakarta.transaction.Transactional;

@Repository
public interface WordUpdateRepository extends JpaRepository<Word, Long> {
    
	Word findByWord(String word);
    
    boolean existsByWordAndUser(String word, Long userId);
    
    @Query("SELECT COUNT(w) FROM Word w WHERE w.word = :word AND w.user = :userId")
    long countByWordAndUser(@Param("word") String word, @Param("userId") Long userId);
    
    @Transactional
    @Modifying
    @Query("UPDATE Word w SET w.counterLike = w.counterLike + 1 WHERE w.word = :word AND w.user = :userId")
    void incrementCounterLike(@Param("word") String word, @Param("userId") Long userId);

    @Transactional
    @Modifying
    @Query("UPDATE Word w SET w.counterDislike = w.counterDislike + 1 WHERE w.word = :word AND w.user = :userId")
    void incrementCounterDislike(@Param("word") String word, @Param("userId") Long userId);

}