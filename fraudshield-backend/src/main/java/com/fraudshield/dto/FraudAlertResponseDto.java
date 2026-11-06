package com.fraudshield.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fraudshield.model.FraudAlert;

import java.time.Instant;
import java.util.List;

public class FraudAlertResponseDto {

    private String id;
    private Object userId;
    private Object transactionId;
    private Integer riskScore;
    private String riskLevel;
    private String priority;
    private List<String> reasons;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;

    public FraudAlertResponseDto() {
    }

    public FraudAlertResponseDto(FraudAlert alert, Object populatedTransaction, Object populatedUser) {
        if (alert != null) {
            this.id = alert.getId();
            this.riskScore = alert.getRiskScore();
            this.riskLevel = alert.getRiskLevel();
            this.priority = alert.getPriority();
            this.reasons = alert.getReasons();
            this.status = alert.getStatus();
            this.createdAt = alert.getCreatedAt();
            this.updatedAt = alert.getUpdatedAt();
            this.transactionId = (populatedTransaction != null) ? populatedTransaction : alert.getTransactionId();
            this.userId = (populatedUser != null) ? populatedUser : alert.getUserId();
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    @JsonProperty("_id")
    public String get_id() {
        return id;
    }

    public Object getUserId() {
        return userId;
    }

    public void setUserId(Object userId) {
        this.userId = userId;
    }

    public Object getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(Object transactionId) {
        this.transactionId = transactionId;
    }

    public Integer getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(Integer riskScore) {
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}

