package com.appil.dto;

import java.io.Serializable;

public class NounDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long idNoun;          // `id_noun` field
    private String abs;           // `abs` field
    private String absIt;         // `abs_it` field
    private Float combinedScore;  // `combined_score` field
    private Long idLevel;         // `id_level` field
    private String img;           // `img` field (image URL or path)
    private String imgAuthor;     // `img_author` field
    private String imgCredit;     // `img_credit` field
    private String imgDescription; // `img_description` field
    private String imgLicense;    // `img_license` field
    private String imgTitle;      // `img_title` field
    private String labelIt;       // `label_it` field
    private Integer lev;          // `lev` field
    private Integer level;        // `level` field
    private Float stemDiff;       // `stem_diff` field
    private String wikiPage;      // `wiki_page` field
    private String word;          // `word` field

    // Getters and Setters
    public Long getIdNoun() {
        return idNoun;
    }

    public void setIdNoun(Long idNoun) {
        this.idNoun = idNoun;
    }

    public String getAbs() {
        return abs;
    }

    public void setAbs(String abs) {
        this.abs = abs;
    }

    public String getAbsIt() {
        return absIt;
    }

    public void setAbsIt(String absIt) {
        this.absIt = absIt;
    }

    public Float getCombinedScore() {
        return combinedScore;
    }

    public void setCombinedScore(Float combinedScore) {
        this.combinedScore = combinedScore;
    }

    public Long getIdLevel() {
        return idLevel;
    }

    public void setIdLevel(Long idLevel) {
        this.idLevel = idLevel;
    }

    public String getImg() {
        return img;
    }

    public void setImg(String img) {
        this.img = img;
    }

    public String getImgAuthor() {
        return imgAuthor;
    }

    public void setImgAuthor(String imgAuthor) {
        this.imgAuthor = imgAuthor;
    }

    public String getImgCredit() {
        return imgCredit;
    }

    public void setImgCredit(String imgCredit) {
        this.imgCredit = imgCredit;
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

    public String getImgTitle() {
        return imgTitle;
    }

    public void setImgTitle(String imgTitle) {
        this.imgTitle = imgTitle;
    }

    public String getLabelIt() {
        return labelIt;
    }

    public void setLabelIt(String labelIt) {
        this.labelIt = labelIt;
    }

    public Integer getLev() {
        return lev;
    }

    public void setLev(Integer lev) {
        this.lev = lev;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public Float getStemDiff() {
        return stemDiff;
    }

    public void setStemDiff(Float stemDiff) {
        this.stemDiff = stemDiff;
    }

    public String getWikiPage() {
        return wikiPage;
    }

    public void setWikiPage(String wikiPage) {
        this.wikiPage = wikiPage;
    }

    public String getWord() {
        return word;
    }

    public void setWord(String word) {
        this.word = word;
    }
}
