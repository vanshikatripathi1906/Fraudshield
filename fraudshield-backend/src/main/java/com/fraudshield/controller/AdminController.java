package com.fraudshield.controller;

import com.fraudshield.dto.AdminStatsResponse;
import com.fraudshield.dto.BulkStatusUpdateRequest;
import com.fraudshield.dto.FraudAlertResponseDto;
import com.fraudshield.dto.StatusUpdateRequest;
import com.fraudshield.model.FraudAlert;
import com.fraudshield.service.AdminService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        AdminStatsResponse stats = adminService.getStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/alerts")
    public ResponseEntity<Map<String, Object>> getAlerts(
            @RequestParam(value = "riskLevel", required = false, defaultValue = "ALL") String riskLevel,
            @RequestParam(value = "status", required = false, defaultValue = "ALL") String status,
            @RequestParam(value = "search", required = false, defaultValue = "") String search) {
        List<FraudAlertResponseDto> alerts = adminService.getAlerts(riskLevel, status, search);
        Map<String, Object> response = new HashMap<>();
        response.put("alerts", alerts);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/alerts/{id}")
    public ResponseEntity<Map<String, Object>> updateAlert(
            @PathVariable("id") String id,
            @RequestBody StatusUpdateRequest request) {
        String status = request != null ? request.getStatus() : null;
        FraudAlert alert = adminService.updateAlertStatus(id, status);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Alert marked as " + (status != null ? status.toLowerCase() : "updated"));
        response.put("alert", alert);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/alerts/bulk")
    public ResponseEntity<Map<String, Object>> bulkUpdateAlerts(@RequestBody BulkStatusUpdateRequest request) {
        Map<String, Object> response = adminService.bulkUpdateAlertStatus(
                request != null ? request.getAlertIds() : null,
                request != null ? request.getStatus() : null
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "/alerts/export", produces = "text/csv")
    public ResponseEntity<String> exportAlerts() {
        String csvData = adminService.exportAlertsToCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"fraudshield-alerts.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }
}
