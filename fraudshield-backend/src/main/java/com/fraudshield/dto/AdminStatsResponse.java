package com.fraudshield.dto;

import java.util.List;

public class AdminStatsResponse {

    private long totalUsers;
    private long totalTransactions;
    private long totalFraudAlerts;

    private long openFraudAlerts;
    private long reviewedAlerts;
    private long dismissedAlerts;

    private long criticalAlerts;
    private long highAlerts;
    private long mediumAlerts;
    private long lowAlerts;

    private long highRiskAlerts;
    private long openCriticalAlerts;
    private long openHighRiskAlerts;

    private long averageRiskScore;
    private long averageFraudAmount;
    private String mostCommonReason;

    private List<FraudAlertResponseDto> recentAlerts;

    public AdminStatsResponse() {
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public long getTotalFraudAlerts() {
        return totalFraudAlerts;
    }

    public void setTotalFraudAlerts(long totalFraudAlerts) {
        this.totalFraudAlerts = totalFraudAlerts;
    }

    public long getOpenFraudAlerts() {
        return openFraudAlerts;
    }

    public void setOpenFraudAlerts(long openFraudAlerts) {
        this.openFraudAlerts = openFraudAlerts;
    }

    public long getReviewedAlerts() {
        return reviewedAlerts;
    }

    public void setReviewedAlerts(long reviewedAlerts) {
        this.reviewedAlerts = reviewedAlerts;
    }

    public long getDismissedAlerts() {
        return dismissedAlerts;
    }

    public void setDismissedAlerts(long dismissedAlerts) {
        this.dismissedAlerts = dismissedAlerts;
    }

    public long getCriticalAlerts() {
        return criticalAlerts;
    }

    public void setCriticalAlerts(long criticalAlerts) {
        this.criticalAlerts = criticalAlerts;
    }

    public long getHighAlerts() {
        return highAlerts;
    }

    public void setHighAlerts(long highAlerts) {
        this.highAlerts = highAlerts;
    }

    public long getMediumAlerts() {
        return mediumAlerts;
    }

    public void setMediumAlerts(long mediumAlerts) {
        this.mediumAlerts = mediumAlerts;
    }

    public long getLowAlerts() {
        return lowAlerts;
    }

    public void setLowAlerts(long lowAlerts) {
        this.lowAlerts = lowAlerts;
    }

    public long getHighRiskAlerts() {
        return highRiskAlerts;
    }

    public void setHighRiskAlerts(long highRiskAlerts) {
        this.highRiskAlerts = highRiskAlerts;
    }

    public long getOpenCriticalAlerts() {
        return openCriticalAlerts;
    }

    public void setOpenCriticalAlerts(long openCriticalAlerts) {
        this.openCriticalAlerts = openCriticalAlerts;
    }

    public long getOpenHighRiskAlerts() {
        return openHighRiskAlerts;
    }

    public void setOpenHighRiskAlerts(long openHighRiskAlerts) {
        this.openHighRiskAlerts = openHighRiskAlerts;
    }

    public long getAverageRiskScore() {
        return averageRiskScore;
    }

    public void setAverageRiskScore(long averageRiskScore) {
        this.averageRiskScore = averageRiskScore;
    }

    public long getAverageFraudAmount() {
        return averageFraudAmount;
    }

    public void setAverageFraudAmount(long averageFraudAmount) {
        this.averageFraudAmount = averageFraudAmount;
    }

    public String getMostCommonReason() {
        return mostCommonReason;
    }

    public void setMostCommonReason(String mostCommonReason) {
        this.mostCommonReason = mostCommonReason;
    }

    public List<FraudAlertResponseDto> getRecentAlerts() {
        return recentAlerts;
    }

    public void setRecentAlerts(List<FraudAlertResponseDto> recentAlerts) {
        this.recentAlerts = recentAlerts;
    }
}

