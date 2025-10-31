package com.appil.dto;

import org.springframework.data.jpa.repository.Query;

public class FlashcardDTO {

	private Long idNoun;
	private Long idLevel;
	private String word;
	private String img;
	private String imgCredit;
	private String imgAuthor;
	private String imgDescription;
	private String imgLicense;
	private String abs;
	private String labelIt;
	private String wikiPage;
	private String absIt;
	private String imgTitle;
	private Float combinedScore;

	public FlashcardDTO(Long idNoun, Long idLevel, String word, String img, String imgCredit, String imgAuthor,
			String imgDescription, String imgLicense, String abs, String labelIt, String wikiPage, String absIt,
			String imgTitle, Float combinedScore) {
		
		this.idNoun = idNoun;
		this.idLevel = idLevel;
		this.word = word;
		this.img = img;
		this.imgCredit = imgCredit;
		this.imgAuthor = imgAuthor;
		this.imgDescription = imgDescription;
		this.imgLicense = imgLicense;
		this.abs = abs;
		this.labelIt = labelIt;
		this.wikiPage = wikiPage;
		this.absIt = absIt;
		this.imgTitle = imgTitle;
		this.combinedScore = combinedScore;
	}

	public FlashcardDTO(Long idNoun, Long idLevel, String word, Integer integer, String img, String imgCredit,
			String imgAuthor, String imgDescription, String imgLicense, String abs, String labelIt, String wikiPage,
			String absIt, String imgTitle) {
		this.idNoun = idNoun;
		this.idLevel = idLevel;
		this.word = word;
		this.img = img;
		this.imgCredit = imgCredit;
		this.imgAuthor = imgAuthor;
		this.imgDescription = imgDescription;
		this.imgLicense = imgLicense;
		this.abs = abs;
		this.labelIt = labelIt;
		this.wikiPage = wikiPage;
		this.absIt = absIt;
		this.imgTitle = imgTitle;
		
	}
	

	public Long getIdNoun() {
		return idNoun;
	}

	public void setIdNoun(Long idNoun) {
		this.idNoun = idNoun;
	}

	public Long getIdLevel() {
		return idLevel;
	}

	public void setIdLevel(Long idLevel) {
		this.idLevel = idLevel;
	}

	public String getWord() {
		return word;
	}

	public void setWord(String word) {
		this.word = word;
	}

	public String getImg() {
		return img;
	}

	public void setImg(String img) {
		this.img = img;
	}

	public String getImgCredit() {
		return imgCredit;
	}

	public void setImgCredit(String imgCredit) {
		this.imgCredit = imgCredit;
	}

	public String getImgAuthor() {
		return imgAuthor;
	}

	public void setImgAuthor(String imgAuthor) {
		this.imgAuthor = imgAuthor;
	}

	public String getImgDescription() {
		return imgDescription;
	}

	public void setImgDescription(String imgDescription) {
		this.imgDescription = imgDescription;
	}

	public String getImgLicense() {
		return imgLicense;
	}

	public void setImgLicense(String imgLicense) {
		this.imgLicense = imgLicense;
	}

	public String getAbs() {
		return abs;
	}

	public void setAbs(String abs) {
		this.abs = abs;
	}

	public String getLabelIt() {
		return labelIt;
	}

	public void setLabelIt(String labelIt) {
		this.labelIt = labelIt;
	}

	public String getWikiPage() {
		return wikiPage;
	}

	public void setWikiPage(String wikiPage) {
		this.wikiPage = wikiPage;
	}

	public String getAbsIt() {
		return absIt;
	}

	public void setAbsIt(String absIt) {
		this.absIt = absIt;
	}

	public String getImgTitle() {
		return imgTitle;
	}

	public void setImgTitle(String imgTitle) {
		this.imgTitle = imgTitle;
	}

	public Float getCombinedScore() {
		return combinedScore;
	}

	public void setCombinedScore(Float combinedScore) {
		this.combinedScore = combinedScore;
	}
}
