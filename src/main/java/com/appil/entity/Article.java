package com.appil.entity;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Article {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
	
	@Column(columnDefinition = "TEXT")
	private String title;
	
	@Column(columnDefinition = "TEXT")
    private String extract;
	
	@Column(columnDefinition = "TEXT")
   private String thumbnailUrl;
	
	@Column(columnDefinition = "TEXT")
   private String thumbnailTitle;
	
	@Column(columnDefinition = "TEXT")
   private String thumbnailLicense;
	
	@Column(columnDefinition = "TEXT")	
   private String thumbnailArtist;
   
   @Column(columnDefinition = "TEXT")
   private String thumbnailCredit;
   
   @Column(columnDefinition = "TEXT")
   private String thumbnailDescription;
   
   @Column(columnDefinition = "TEXT")
   private String thumbnailUrlSource;
   
   @DateTimeFormat(pattern = "dd-MM-yyyy")
   private LocalDate featuredDate;
   
	
	   public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public String getExtract() {
		return extract;
	}
	public void setExtract(String extract) {
		this.extract = extract;
	}
	public String getThumbnailUrl() {
		return thumbnailUrl;
	}
	public void setThumbnailUrl(String thumbnailUrl) {
		this.thumbnailUrl = thumbnailUrl;
	}
	public String getThumbnailTitle() {
		return thumbnailTitle;
	}
	public void setThumbnailTitle(String thumbnailTitle) {
		this.thumbnailTitle = thumbnailTitle;
	}
	public String getThumbnailLicense() {
		return thumbnailLicense;
	}
	public void setThumbnailLicense(String thumbnailLicense) {
		this.thumbnailLicense = thumbnailLicense;
	}
	public String getThumbnailArtist() {
		return thumbnailArtist;
	}
	public void setThumbnailArtist(String thumbnailArtist) {
		this.thumbnailArtist = thumbnailArtist;
	}
	public String getThumbnailCredit() {
		return thumbnailCredit;
	}
	public void setThumbnailCredit(String thumbnailCredit) {
		this.thumbnailCredit = thumbnailCredit;
	}
	public String getThumbnailDescription() {
		return thumbnailDescription;
	}
	public void setThumbnailDescription(String thumbnailDescription) {
		this.thumbnailDescription = thumbnailDescription;
	}
	public String getThumbnailUrlSource() {
		return thumbnailUrlSource;
	}
	public void setThumbnailUrlSource(String thumbnailUrlSource) {
		this.thumbnailUrlSource = thumbnailUrlSource;
	}
	public LocalDate getFeaturedDate() {
		return featuredDate;
	}
	public void setFeaturedDate(LocalDate featuredDate) {
		this.featuredDate = featuredDate;
	}
	

}
