package com.fraudshield.service;

import com.fraudshield.dto.AdminStatsResponse;
import com.fraudshield.dto.FraudAlertResponseDto;
import com.fraudshield.exception.ApiException;
import com.fraudshield.model.FraudAlert;
import com.fraudshield.model.Transaction;
import com.fraudshield.model.User;
import com.fraudshield.repository.FraudAlertRepository;
import com.fraudshield.repository.TransactionRepository;
import com.fraudshield.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private static final Set<String> VALID_STATUSES = Set.of("REVIEWED", "DISMISSED");

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final FraudAlertRepository fraudAlertRepository;

    public AdminService(UserRepository userRepository,
                        TransactionRepository transactionRepository,
                        FraudAlertRepository fraudAlertRepository) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.fraudAlertRepository = fraudAlertRepository;
    }

    public AdminStatsResponse getStats() {
        AdminStatsResponse stats = new AdminStatsResponse();

        long totalUsers = userRepository.count();
        long totalTransactions = transactionRepository.count();
        long totalFraudAlerts = fraudAlertRepository.count();

        stats.setTotalUsers(totalUsers);
        stats.setTotalTransactions(totalTransactions);
        stats.setTotalFraudAlerts(totalFraudAlerts);

        stats.setOpenFraudAlerts(fraudAlertRepository.countByStatus("OPEN"));
        stats.setReviewedAlerts(fraudAlertRepository.countByStatus("REVIEWED"));
        stats.setDismissedAlerts(fraudAlertRepository.countByStatus("DISMISSED"));

        stats.setCriticalAlerts(fraudAlertRepository.countByRiskLevel("CRITICAL"));
        stats.setHighAlerts(fraudAlertRepository.countByRiskLevel("HIGH"));
        stats.setMediumAlerts(fraudAlertRepository.countByRiskLevel("MEDIUM"));
        stats.setLowAlerts(fraudAlertRepository.countByRiskLevel("LOW"));

        List<String> highRiskLevels = List.of("HIGH", "CRITICAL");
        stats.setHighRiskAlerts(fraudAlertRepository.countByRiskLevelIn(highRiskLevels));
        stats.setOpenCriticalAlerts(fraudAlertRepository.countByRiskLevelAndStatus("CRITICAL", "OPEN"));
        stats.setOpenHighRiskAlerts(fraudAlertRepository.countByRiskLevelInAndStatus(highRiskLevels, "OPEN"));

        List<FraudAlert> allAlerts = fraudAlertRepository.findAllByOrderByCreatedAtDesc();

        // Collect transaction IDs to populate
        Set<String> txIds = allAlerts.stream()
                .map(FraudAlert::getTransactionId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<String, Transaction> txMap = transactionRepository.findAllById(txIds).stream()
                .collect(Collectors.toMap(Transaction::getId, Function.identity(), (a, b) -> a));

        // Average Risk Score
        long totalRiskScore = 0;
        for (FraudAlert alert : allAlerts) {
            if (alert.getRiskScore() != null) {
                totalRiskScore += alert.getRiskScore();
            }
        }
        stats.setAverageRiskScore(totalFraudAlerts > 0 ? Math.round((double) totalRiskScore / totalFraudAlerts) : 0);

        // Average Fraud Transaction Amount
        double totalFraudAmount = 0.0;
        long fraudAmountCount = 0;
        Map<String, Integer> reasonCounts = new HashMap<>();

        for (FraudAlert alert : allAlerts) {
            Transaction tx = txMap.get(alert.getTransactionId());
            if (tx != null && tx.getAmount() != null) {
                totalFraudAmount += tx.getAmount();
                fraudAmountCount++;
            }

            if (alert.getReasons() != null) {
                for (String reason : alert.getReasons()) {
                    reasonCounts.merge(reason, 1, Integer::sum);
                }
            }
        }

        stats.setAverageFraudAmount(fraudAmountCount > 0 ? Math.round(totalFraudAmount / fraudAmountCount) : 0);

        // Most Common Reason
        String mostCommonReason = "No fraud reason available";
        int highestCount = 0;
        for (Map.Entry<String, Integer> entry : reasonCounts.entrySet()) {
            if (entry.getValue() > highestCount) {
                highestCount = entry.getValue();
                mostCommonReason = entry.getKey();
            }
        }
        stats.setMostCommonReason(mostCommonReason);

        // Recent 5 Alerts populated with User and Transaction
        List<FraudAlert> recentAlertList = fraudAlertRepository.findTop5ByOrderByCreatedAtDesc();
        stats.setRecentAlerts(populateAlerts(recentAlertList));

        return stats;
    }

    public List<FraudAlertResponseDto> getAlerts(String riskLevel, String status, String search) {
        List<FraudAlert> allAlerts = fraudAlertRepository.findAllByOrderByCreatedAtDesc();

        // 1. Filter by Risk Level
        if (riskLevel != null && !riskLevel.equalsIgnoreCase("ALL")) {
            allAlerts = allAlerts.stream()
                    .filter(a -> riskLevel.equalsIgnoreCase(a.getRiskLevel()))
                    .collect(Collectors.toList());
        }

        // 2. Filter by Status
        if (status != null && !status.equalsIgnoreCase("ALL")) {
            allAlerts = allAlerts.stream()
                    .filter(a -> status.equalsIgnoreCase(a.getStatus()))
                    .collect(Collectors.toList());
        }

        List<FraudAlertResponseDto> populated = populateAlerts(allAlerts);

        // 3. Search query filter
        if (search != null && !search.trim().isEmpty()) {
            String lowerSearch = search.trim().toLowerCase();
            populated = populated.stream().filter(alert -> {
                String userName = "";
                String userEmail = "";
                if (alert.getUserId() instanceof Map<?, ?> userMap) {
                    Object nameObj = userMap.get("name");
                    userName = nameObj != null ? nameObj.toString() : "";
                    Object emailObj = userMap.get("email");
                    userEmail = emailObj != null ? emailObj.toString() : "";
                }

                String merchant = "";
                String location = "";
                String device = "";
                if (alert.getTransactionId() instanceof Transaction tx) {
                    merchant = tx.getMerchant() != null ? tx.getMerchant() : "";
                    location = tx.getLocation() != null ? tx.getLocation() : "";
                    device = tx.getDevice() != null ? tx.getDevice() : "";
                }

                return userName.toLowerCase().contains(lowerSearch)
                        || userEmail.toLowerCase().contains(lowerSearch)
                        || merchant.toLowerCase().contains(lowerSearch)
                        || location.toLowerCase().contains(lowerSearch)
                        || device.toLowerCase().contains(lowerSearch);
            }).collect(Collectors.toList());
        }

        if (populated.size() > 50) {
            populated = populated.subList(0, 50);
        }

        return populated;
    }

    public FraudAlert updateAlertStatus(String id, String status) {
        if (status == null || !VALID_STATUSES.contains(status.trim().toUpperCase())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid alert status");
        }

        FraudAlert alert = fraudAlertRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Fraud alert not found"));

        alert.setStatus(status.trim().toUpperCase());
        alert.setUpdatedAt(Instant.now());
        return fraudAlertRepository.save(alert);
    }

    public Map<String, Object> bulkUpdateAlertStatus(List<String> alertIds, String status) {
        if (status == null || !VALID_STATUSES.contains(status.trim().toUpperCase())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid alert status");
        }
        if (alertIds == null || alertIds.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No alerts selected");
        }

        String upperStatus = status.trim().toUpperCase();
        List<FraudAlert> alerts = fraudAlertRepository.findAllById(alertIds);
        int count = 0;
        for (FraudAlert alert : alerts) {
            if ("OPEN".equalsIgnoreCase(alert.getStatus())) {
                alert.setStatus(upperStatus);
                alert.setUpdatedAt(Instant.now());
                count++;
            }
        }
        fraudAlertRepository.saveAll(alerts);

        Map<String, Object> response = new HashMap<>();
        response.put("message", count + " alert(s) updated successfully.");
        response.put("updatedCount", count);
        return response;
    }

    public String exportAlertsToCsv() {
        List<FraudAlertResponseDto> alerts = populateAlerts(fraudAlertRepository.findAllByOrderByCreatedAtDesc());
        StringBuilder sb = new StringBuilder();
        sb.append("Alert ID,Risk Level,Risk Score,Status,User Name,User Email,Merchant,Amount,Location,Device,Reasons,Detected Date\n");

        for (FraudAlertResponseDto alert : alerts) {
            String userName = "";
            String userEmail = "";
            if (alert.getUserId() instanceof Map<?, ?> userMap) {
                Object n = userMap.get("name");
                userName = n != null ? n.toString() : "";
                Object e = userMap.get("email");
                userEmail = e != null ? e.toString() : "";
            }

            String merchant = "";
            String amount = "";
            String location = "";
            String device = "";
            if (alert.getTransactionId() instanceof Transaction tx) {
                merchant = tx.getMerchant() != null ? tx.getMerchant() : "";
                amount = tx.getAmount() != null ? String.valueOf(tx.getAmount()) : "";
                location = tx.getLocation() != null ? tx.getLocation() : "";
                device = tx.getDevice() != null ? tx.getDevice() : "";
            }

            String reasons = alert.getReasons() != null ? String.join("; ", alert.getReasons()) : "";
            String date = alert.getCreatedAt() != null ? alert.getCreatedAt().toString() : "";

            sb.append(escapeCsv(alert.getId())).append(",")
                    .append(escapeCsv(alert.getRiskLevel())).append(",")
                    .append(alert.getRiskScore() != null ? alert.getRiskScore() : 0).append(",")
                    .append(escapeCsv(alert.getStatus())).append(",")
                    .append(escapeCsv(userName)).append(",")
                    .append(escapeCsv(userEmail)).append(",")
                    .append(escapeCsv(merchant)).append(",")
                    .append(amount).append(",")
                    .append(escapeCsv(location)).append(",")
                    .append(escapeCsv(device)).append(",")
                    .append(escapeCsv(reasons)).append(",")
                    .append(escapeCsv(date)).append("\n");
        }

        return sb.toString();
    }

    private String escapeCsv(String val) {
        if (val == null) return "\"\"";
        return "\"" + val.replace("\"", "\"\"") + "\"";
    }

    private List<FraudAlertResponseDto> populateAlerts(List<FraudAlert> alerts) {
        if (alerts == null || alerts.isEmpty()) {
            return Collections.emptyList();
        }

        Set<String> txIds = alerts.stream()
                .map(FraudAlert::getTransactionId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<String> userIds = alerts.stream()
                .map(FraudAlert::getUserId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<String, Transaction> txMap = transactionRepository.findAllById(txIds).stream()
                .collect(Collectors.toMap(Transaction::getId, Function.identity(), (a, b) -> a));

        Map<String, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity(), (a, b) -> a));

        return alerts.stream().map(alert -> {
            Transaction tx = txMap.get(alert.getTransactionId());
            User u = userMap.get(alert.getUserId());

            Map<String, Object> userObj = null;
            if (u != null) {
                userObj = new HashMap<>();
                userObj.put("id", u.getId());
                userObj.put("_id", u.getId());
                userObj.put("name", u.getName());
                userObj.put("email", u.getEmail());
            }

            return new FraudAlertResponseDto(alert, tx, userObj);
        }).collect(Collectors.toList());
    }
}