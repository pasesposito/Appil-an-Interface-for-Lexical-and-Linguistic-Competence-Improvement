package com.appil.dto;

public class WordMetrics {
    private double stemDiff;
    private double levenshteinDistance;
    private double nationLevel;
    private Float combinedScore;

    public WordMetrics(double stemDiff, double levenshteinDistance, double nationLevel, Float combinedScore) {
        this.stemDiff = stemDiff;
        this.levenshteinDistance = levenshteinDistance;
        this.nationLevel = nationLevel;
        this.combinedScore = combinedScore;
    }

    public double getStemDiff() {
        return stemDiff;
    }

    public double getLevenshteinDistance() {
        return levenshteinDistance;
    }

    public double getNationLevel() {
        return nationLevel;
    }

    public Float getCombinedScore() {
        return combinedScore;
    }
}
