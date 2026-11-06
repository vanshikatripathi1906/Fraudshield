package com.fraudshield.dto;

import java.util.ArrayList;
import java.util.List;

public class FraudAnalysisResult {

    private int riskScore;
    private String riskLevel;
    private String priority;
    private List<String> reasons = new ArrayList<>();

    public FraudAnalysisResult() {
    }

    public FraudAnalysisResult(int riskScore, String riskLevel, String priority, List<String> reasons) {
        this.riskScore = riskScore;
        this.riskLevel = riskLevel;
        this.priority = priority;
        this.reasons = (reasons != null) ? reasons : new ArrayList<>();
    }

    public int getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(int riskScore) {
        this.riskScore = riskScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public List<String> getReasons() {
        return reasons;
    }

    public void setReasons(List<String> reasons) {
        this.reasons = reasons;
    }
}

