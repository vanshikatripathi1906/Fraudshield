package com.fraudshield.dto;

public class CsvUploadResponse {

    private String message;
    private int importedTransactions;
    private int fraudAlerts;

    public CsvUploadResponse() {
    }

    public CsvUploadResponse(String message, int importedTransactions, int fraudAlerts) {
        this.message = message;
        this.importedTransactions = importedTransactions;
        this.fraudAlerts = fraudAlerts;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public int getImportedTransactions() {
        return importedTransactions;
    }

    public void setImportedTransactions(int importedTransactions) {
        this.importedTransactions = importedTransactions;
    }

    public int getFraudAlerts() {
        return fraudAlerts;
    }

    public void setFraudAlerts(int fraudAlerts) {
        this.fraudAlerts = fraudAlerts;
    }
}

