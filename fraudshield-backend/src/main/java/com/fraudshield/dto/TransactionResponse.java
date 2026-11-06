package com.fraudshield.dto;

import com.fraudshield.model.FraudAlert;
import com.fraudshield.model.Transaction;

public class TransactionResponse {

    private String message;
    private Transaction transaction;
    private FraudAnalysisResult fraudAnalysis;
    private boolean fraudAlertCreated;
    private FraudAlert fraudAlert;

    public TransactionResponse() {
    }

    public TransactionResponse(String message, Transaction transaction, FraudAnalysisResult fraudAnalysis, boolean fraudAlertCreated, FraudAlert fraudAlert) {
        this.message = message;
        this.transaction = transaction;
        this.fraudAnalysis = fraudAnalysis;
        this.fraudAlertCreated = fraudAlertCreated;
        this.fraudAlert = fraudAlert;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Transaction getTransaction() {
        return transaction;
    }

    public void setTransaction(Transaction transaction) {
        this.transaction = transaction;
    }

    public FraudAnalysisResult getFraudAnalysis() {
        return fraudAnalysis;
    }

    public void setFraudAnalysis(FraudAnalysisResult fraudAnalysis) {
        this.fraudAnalysis = fraudAnalysis;
    }

    public boolean isFraudAlertCreated() {
        return fraudAlertCreated;
    }

    public void setFraudAlertCreated(boolean fraudAlertCreated) {
        this.fraudAlertCreated = fraudAlertCreated;
    }

    public FraudAlert getFraudAlert() {
        return fraudAlert;
    }

    public void setFraudAlert(FraudAlert fraudAlert) {
        this.fraudAlert = fraudAlert;
    }
}

