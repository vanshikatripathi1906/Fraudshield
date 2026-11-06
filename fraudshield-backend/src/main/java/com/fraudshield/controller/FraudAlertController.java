package com.fraudshield.controller;

import com.fraudshield.dto.FraudAlertResponseDto;
import com.fraudshield.dto.StatusUpdateRequest;
import com.fraudshield.model.FraudAlert;
import com.fraudshield.security.UserPrincipal;
import com.fraudshield.service.FraudAlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fraud-alerts")
public class FraudAlertController {

    private final FraudAlertService fraudAlertService;

    public FraudAlertController(FraudAlertService fraudAlertService) {
        this.fraudAlertService = fraudAlertService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAlerts(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<FraudAlertResponseDto> alerts = fraudAlertService.getAlertsForUser(userPrincipal.getId());
        Map<String, Object> response = new HashMap<>();
        response.put("alerts", alerts);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateAlertStatus(
            @PathVariable("id") String id,
            @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        FraudAlert updatedAlert = fraudAlertService.updateAlertStatus(
                id,
                userPrincipal.getId(),
                request != null ? request.getStatus() : null
        );

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Alert status updated successfully");
        response.put("alert", updatedAlert);
        return ResponseEntity.ok(response);
    }
}

