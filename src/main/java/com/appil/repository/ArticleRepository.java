package com.appil.repository;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.appil.entity.Article;

import jakarta.persistence.Table;

	@Repository
	@Table(name = "article")
	public interface ArticleRepository extends JpaRepository<Article, Long> {
		
		Optional<Article> findByFeaturedDate(LocalDate date);
	   
	   boolean existsByFeaturedDate(LocalDate featuredDate);
	   
	   @Query("SELECT COUNT(a) FROM Article a WHERE a.title = ?1")
	    int countByTitle(String title);
	    
	    
	}
