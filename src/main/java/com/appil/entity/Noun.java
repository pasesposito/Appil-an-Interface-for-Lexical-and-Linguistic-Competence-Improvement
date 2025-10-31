package com.appil.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "noun") 

public class Noun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idNoun")
    private Long idNoun;

    @Column(name = "idLevel")
    private Long idLevel;

    @Column(name = "word", length = 100)
    private String word;
    
    @Column(name = "img", columnDefinition = "TEXT")
    private String img;

    @Column(name = "imgCredit", columnDefinition = "TEXT")
    private String imgCredit;

    @Column(name = "imgAuthor", columnDefinition = "TEXT")
    private String imgAuthor;

    @Column(name = "imgDescription", columnDefinition = "TEXT")
    private String imgDescription;

    @Column(name = "imgLicense", columnDefinition = "TEXT")
    private String imgLicense;

    @Column(name = "abs", columnDefinition = "TEXT")
    private String abs;

    @Column(name = "labelIt", columnDefinition = "TEXT")
    private String labelIt;

    @Column(name = "wikiPage", columnDefinition = "TEXT")
    private String wikiPage;

    @Column(name = "absIt", columnDefinition = "TEXT")
    private String absIt;

    @Column(name = "imgTitle", columnDefinition = "TEXT")
    private String imgTitle;

    @Column(name = "stemDiff")
    private Float stemDiff;

    @Column(name = "level")
    private Integer level;
    
    @Column(name = "lev")
    private Integer levhensteinDistance;

    @Column(name = "combined_score")
    private Float combinedScore;

    // Getters and Setters
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

    public Float getStemDiff() {
        return stemDiff;
    }

    public void setStemDiff(Float stemDiff) {
        this.stemDiff = stemDiff;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public Float getCombinedScore() {
        return combinedScore;
    }

    public void setCombinedScore(Float combinedScore) {
        this.combinedScore = combinedScore;
    }

	public Integer getLevhensteinDistance() {
		return levhensteinDistance;
	}

	public void setLevhensteinDistance(Integer levhensteinDistance) {
		this.levhensteinDistance = levhensteinDistance;
	}
}

