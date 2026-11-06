package com.fraudshield.service;

import com.fraudshield.dto.FraudAlertResponseDto;
import com.fraudshield.exception.ApiException;
import com.fraudshield.model.FraudAlert;
import com.fraudshield.model.Transaction;
import com.fraudshield.repository.FraudAlertRepository;
import com.fraudshield.repository.TransactionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class FraudAlertService {

    private static final Set<String> VALID_STATUSES = Set.of("REVIEWED", "DISMISSED");

    private final FraudAlertRepository fraudAlertRepository;
    private final TransactionRepository transactionRepository;

    public FraudAlertService(FraudAlertRepository fraudAlertRepository,
                             TransactionRepository transactionRepository) {
        this.fraudAlertRepository = fraudAlertRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<FraudAlertResponseDto> getAlertsForUser(String userId) {
        List<FraudAlert> alerts = fraudAlertRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (alerts.isEmpty()) {
            return Collections.emptyList();
        }

        Set<String> transactionIds = alerts.stream()
                .map(FraudAlert::getTransactionId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<String, Transaction> transactionMap = transactionRepository.findAllById(transactionIds).stream()
                .collect(Collectors.toMap(Transaction::getId, Function.identity(), (a, b) -> a));

        return alerts.stream()
                .map(alert -> new FraudAlertResponseDto(alert, transactionMap.get(alert.getTransactionId()), null))
                .collect(Collectors.toList());
    }

    public FraudAlert updateAlertStatus(String alertId, String userId, String status) {
        if (status == null || !VALID_STATUSES.contains(status.trim().toUpperCase())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid status");
        }

        FraudAlert alert = fraudAlertRepository.findByIdAndUserId(alertId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Fraud alert not found"));

        alert.setStatus(status.trim().toUpperCase());
        alert.setUpdatedAt(Instant.now());
        return fraudAlertRepository.save(alert);
    }
}

