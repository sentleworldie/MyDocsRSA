package com.documentverification.backend.dto;

public class ReviewRequest {

    private String reason;

    public ReviewRequest() {
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}