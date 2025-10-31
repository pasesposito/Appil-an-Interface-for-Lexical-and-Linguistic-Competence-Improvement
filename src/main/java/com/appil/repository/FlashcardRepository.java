package com.appil.repository;


import com.appil.dto.FlashcardDTO;
import com.appil.entity.Flashcard;
import com.appil.entity.Noun;
import com.appil.entity.User;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FlashcardRepository extends JpaRepository<Flashcard, Long> {
    
	 boolean existsByUserAndNoun(User user, Noun noun);
	 
	 
	 @Query("SELECT new com.appil.dto.FlashcardDTO(n.idNoun, n.idLevel, n.word,  n.img, " +
	           "n.imgCredit, n.imgAuthor, n.imgDescription, n.imgLicense, n.abs, n.labelIt, " +
	           "n.wikiPage, n.absIt, n.imgTitle, n.combinedScore) " +
	           "FROM Flashcard fc JOIN fc.noun n WHERE fc.user.id = :idUser")
	    List<FlashcardDTO> findAllByUserIdWithNoun(@Param("idUser") Long idUser);
   
}
