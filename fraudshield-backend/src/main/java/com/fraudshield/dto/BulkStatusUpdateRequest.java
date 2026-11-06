package com.fraudshield.dto;

import java.util.List;

public class BulkStatusUpdateRequest {

    private List<String> alertIds;
    private String status;

    public BulkStatusUpdateRequest() {
    }

    public BulkStatusUpdateRequest(List<String> alertIds, String status) {
        this.alertIds = alertIds;
        this.status = status;
    }

    public List<String> getAlertIds() {
        return alertIds;
    }

    public void setAlertIds(List<String> alertIds) {
        this.alertIds = alertIds;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
