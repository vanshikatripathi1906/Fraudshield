package com.fraudshield.service;

import com.fraudshield.dto.FraudAnalysisResult;
import com.fraudshield.dto.TransactionRequest;
import com.fraudshield.dto.TransactionResponse;
import com.fraudshield.exception.ApiException;
import com.fraudshield.model.FraudAlert;
import com.fraudshield.model.Transaction;
import com.fraudshield.repository.FraudAlertRepository;
import com.fraudshield.repository.TransactionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class TransactionService {

    private static final Set<String> ALLOWED_PAYMENT_METHODS = Set.of(
            "UPI", "CARD", "BANK_TRANSFER", "CASH", "OTHER"
    );

    private final TransactionRepository transactionRepository;
    private final FraudAlertRepository fraudAlertRepository;
    private final FraudEngineService fraudEngineService;

    public TransactionService(TransactionRepository transactionRepository,
                              FraudAlertRepository fraudAlertRepository,
                              FraudEngineService fraudEngineService) {
        this.transactionRepository = transactionRepository;
        this.fraudAlertRepository = fraudAlertRepository;
        this.fraudEngineService = fraudEngineService;
    }

    public List<Transaction> getTransactions(String userId) {
        return transactionRepository.findTop100ByUserIdOrderByTransactionTimeDesc(userId);
    }

    public Map<String, Object> getTransactionDetails(String id, String userId) {
        if (id == null || id.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid transaction ID");
        }

        Transaction transaction = transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Transaction not found"));

        Optional<FraudAlert> fraudAlert = fraudAlertRepository.findByTransactionIdAndUserId(id, userId);

        Map<String, Object> response = new HashMap<>();
        response.put("transaction", transaction);
        response.put("fraudAlert", fraudAlert.orElse(null));
        return response;
    }

    public TransactionResponse createTransaction(TransactionRequest request, String userId) {
        if (request == null || request.getAmount() == null || request.getLocation() == null || request.getDevice() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Amount, location and device are required");
        }

        double numericAmount;
        try {
            numericAmount = Double.parseDouble(String.valueOf(request.getAmount()).trim());
        } catch (NumberFormatException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Transaction amount must be a valid number");
        }

        if (!Double.isFinite(numericAmount) || numericAmount <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Transaction amount must be greater than 0");
        }
        if (numericAmount > 10000000) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Transaction amount is too large");
        }

        String cleanLocation = request.getLocation().trim();
        if (cleanLocation.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Location cannot be empty");
        }
        if (cleanLocation.length() > 100) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Location is too long");
        }

        String cleanDevice = request.getDevice().trim();
        if (cleanDevice.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Device cannot be empty");
        }
        if (cleanDevice.length() > 100) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Device is too long");
        }

        String paymentMethod = "OTHER";
        if (request.getPaymentMethod() != null && !request.getPaymentMethod().isBlank()) {
            String upper = request.getPaymentMethod().trim().toUpperCase();
            if (!ALLOWED_PAYMENT_METHODS.contains(upper)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid payment method");
            }
            paymentMethod = upper;
        }

        String cleanMerchant = "Unknown";
        if (request.getMerchant() != null && !request.getMerchant().isBlank()) {
            cleanMerchant = request.getMerchant().trim();
            if (cleanMerchant.length() > 150) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Merchant name is too long");
            }
        }

        Instant finalTransactionTime = Instant.now();
        if (request.getTransactionTime() != null && !request.getTransactionTime().isBlank()) {
            try {
                Instant parsedTime = Instant.parse(request.getTransactionTime().trim());
                Instant fiveMinutesFromNow = Instant.now().plus(5, ChronoUnit.MINUTES);
                if (parsedTime.isAfter(fiveMinutesFromNow)) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "Transaction time cannot be in the future");
                }
                finalTransactionTime = parsedTime;
            } catch (DateTimeParseException e) {
                try {
                    java.time.LocalDateTime ldt = java.time.LocalDateTime.parse(request.getTransactionTime().trim());
                    Instant parsedTime = ldt.atZone(java.time.ZoneId.systemDefault()).toInstant();
                    Instant fiveMinutesFromNow = Instant.now().plus(5, ChronoUnit.MINUTES);
                    if (parsedTime.isAfter(fiveMinutesFromNow)) {
                        throw new ApiException(HttpStatus.BAD_REQUEST, "Transaction time cannot be in the future");
                    }
                    finalTransactionTime = parsedTime;
                } catch (Exception ex) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "Transaction time must be a valid date");
                }
            }
        }

        Transaction transaction = new Transaction();
        transaction.setUserId(userId);
        transaction.setAmount(numericAmount);
        transaction.setCurrency("INR");
        transaction.setLocation(cleanLocation);
        transaction.setDevice(cleanDevice);
        transaction.setPaymentMethod(paymentMethod);
        transaction.setMerchant(cleanMerchant);
        transaction.setSource("MANUAL");
        transaction.setTransactionTime(finalTransactionTime);
        transaction.setStatus("COMPLETED");

        Transaction savedTransaction = transactionRepository.save(transaction);

        FraudAnalysisResult fraudResult;
        try {
            fraudResult = fraudEngineService.checkTransaction(savedTransaction);
        } catch (Exception e) {
            transactionRepository.deleteById(savedTransaction.getId());
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to complete fraud analysis");
        }

        FraudAlert fraudAlert = null;
        if (fraudResult.getRiskScore() >= 30) {
            try {
                fraudAlert = new FraudAlert(
                        userId,
                        savedTransaction.getId(),
                        fraudResult.getRiskScore(),
                        fraudResult.getRiskLevel(),
                        fraudResult.getPriority(),
                        fraudResult.getReasons()
                );
                fraudAlert = fraudAlertRepository.save(fraudAlert);
            } catch (Exception e) {
                fraudAlert = null;
            }
        }

        return new TransactionResponse(
                "Transaction added successfully",
                savedTransaction,
                fraudResult,
                fraudAlert != null,
                fraudAlert
        );
    }
}

