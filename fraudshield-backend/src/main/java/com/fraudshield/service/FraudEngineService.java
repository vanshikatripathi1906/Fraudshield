package com.fraudshield.service;

import com.fraudshield.dto.FraudAnalysisResult;
import com.fraudshield.model.Transaction;
import com.fraudshield.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class FraudEngineService {

    private final TransactionRepository transactionRepository;

    public FraudEngineService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public FraudAnalysisResult checkTransaction(Transaction transaction) {
        if (transaction == null) {
            throw new IllegalArgumentException("Transaction is required");
        }

        if (transaction.getUserId() == null || transaction.getUserId().isBlank()) {
            throw new IllegalArgumentException("Transaction user is required");
        }

        Double amount = transaction.getAmount();
        if (amount == null || !Double.isFinite(amount) || amount <= 0) {
            throw new IllegalArgumentException("Invalid transaction amount");
        }

        Instant transactionTime = transaction.getTransactionTime();
        if (transactionTime == null) {
            throw new IllegalArgumentException("Invalid transaction time");
        }

        // Fetch up to 100 previous transactions for this user (excluding current)
        List<Transaction> previousTransactions;
        if (transaction.getId() != null) {
            previousTransactions = transactionRepository.findTop100ByUserIdAndIdNotOrderByTransactionTimeDesc(
                    transaction.getUserId(),
                    transaction.getId()
            );
        } else {
            previousTransactions = transactionRepository.findTop100ByUserIdOrderByTransactionTimeDesc(
                    transaction.getUserId()
            );
        }

        return evaluateRules(transaction, previousTransactions);
    }

    public FraudAnalysisResult evaluateRules(Transaction transaction, List<Transaction> previousTransactions) {
        if (previousTransactions == null) {
            previousTransactions = new ArrayList<>();
        }

        double amount = transaction.getAmount() != null ? transaction.getAmount() : 0.0;
        Instant transactionTime = transaction.getTransactionTime() != null ? transaction.getTransactionTime() : Instant.now();

        int score = 0;
        List<String> reasons = new ArrayList<>();

        // ==========================================
        // RULE 1: AMOUNT ANOMALY (+25 POINTS)
        // ==========================================
        if (previousTransactions.size() >= 3) {
            double totalAmount = previousTransactions.stream()
                    .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                    .sum();
            double averageAmount = totalAmount / previousTransactions.size();

            if (averageAmount > 0 && amount > averageAmount * 3.0) {
                score += 25;
                reasons.add("Transaction amount is significantly higher than the user's previous average");
            }
        }

        // ==========================================
        // RULE 2: NEW DEVICE (+20 POINTS)
        // ==========================================
        if (!previousTransactions.isEmpty() && transaction.getDevice() != null && !transaction.getDevice().isBlank()) {
            Set<String> knownDevices = previousTransactions.stream()
                    .map(Transaction::getDevice)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            if (!knownDevices.contains(transaction.getDevice())) {
                score += 20;
                reasons.add("Transaction was made from a new device");
            }
        }

        // ==========================================
        // RULE 3: NEW LOCATION (+20 POINTS)
        // ==========================================
        if (!previousTransactions.isEmpty() && transaction.getLocation() != null && !transaction.getLocation().isBlank()) {
            Set<String> knownLocations = previousTransactions.stream()
                    .map(Transaction::getLocation)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            if (!knownLocations.contains(transaction.getLocation())) {
                score += 20;
                reasons.add("Transaction occurred from a new location");
            }
        }

        // ==========================================
        // RULE 4: UNUSUAL TRANSACTION TIME (+10 POINTS)
        // 00:00 to 05:00
        // ==========================================
        ZonedDateTime zdt = transactionTime.atZone(ZoneId.systemDefault());
        int hour = zdt.getHour();
        if (hour >= 0 && hour < 5) {
            score += 10;
            reasons.add("Transaction occurred during unusual hours");
        }

        // ==========================================
        // RULE 5: HIGH TRANSACTION FREQUENCY (+15 POINTS)
        // >= 3 transactions in the last 10 minutes
        // ==========================================
        Instant tenMinutesAgo = transactionTime.minus(10, ChronoUnit.MINUTES);
        long recentCount = previousTransactions.stream()
                .filter(t -> t.getTransactionTime() != null)
                .filter(t -> (t.getTransactionTime().isAfter(tenMinutesAgo) || t.getTransactionTime().equals(tenMinutesAgo))
                        && t.getTransactionTime().isBefore(transactionTime))
                .count();

        if (recentCount >= 3) {
            score += 15;
            reasons.add("Multiple transactions occurred within a short time period");
        }

        // ==========================================
        // CAP SCORE AT 90
        // ==========================================
        score = Math.min(score, 90);

        // ==========================================
        // DETERMINE RISK LEVEL & PRIORITY
        // ==========================================
        String riskLevel = "LOW";
        if (score >= 80) {
            riskLevel = "CRITICAL";
        } else if (score >= 60) {
            riskLevel = "HIGH";
        } else if (score >= 30) {
            riskLevel = "MEDIUM";
        }

        String priority = riskLevel;

        return new FraudAnalysisResult(score, riskLevel, priority, reasons);
    }
}

