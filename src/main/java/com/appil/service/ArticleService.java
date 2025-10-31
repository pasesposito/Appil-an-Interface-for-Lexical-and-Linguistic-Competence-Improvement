package com.appil.service;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.appil.entity.Article;
import com.appil.repository.ArticleRepository;

import jakarta.transaction.Transactional;

@Service
public class ArticleService {
	
	@Autowired
	ArticleRepository articleRepository;
	
	 @Transactional
	    public Optional<Article> loadArticleByDate(String date) {
		 	
		 	return articleRepository.findByFeaturedDate(LocalDate.parse(date));
	    
	 }
	 
	 
	 @Transactional
	    public void saveArticle(Article article) throws Exception {
		 
	        int count = articleRepository.countByTitle(article.getTitle());
	        
	        if (count > 0) {
	            throw new Exception("Article already exists");
	        }
	        
	        articleRepository.save(article);
	    }

}
