package com.appil.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.appil.entity.Noun;

@Repository
public interface NounRepository extends JpaRepository<Noun, Long> {

	boolean existsByWord(String word);
	
    Optional<Noun> findByWord(String word);

//    @Query("SELECT n FROM Noun n JOIN Flashcard fc ON fc.noun.idNoun = n.idNoun WHERE fc.idUser = :idUser")
//    List<Noun> findAllByUserId(@Param("idUser") Long idUser);
    
}