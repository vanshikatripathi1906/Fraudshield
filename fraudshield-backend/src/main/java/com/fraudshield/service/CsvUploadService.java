package com.fraudshield.service;

import com.fraudshield.dto.CsvUploadResponse;
import com.fraudshield.dto.FraudAnalysisResult;
import com.fraudshield.exception.ApiException;
import com.fraudshield.model.FraudAlert;
import com.fraudshield.model.Transaction;
import com.fraudshield.repository.FraudAlertRepository;
import com.fraudshield.repository.TransactionRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.Set;

@Service
public class CsvUploadService {

    private static final Set<String> ALLOWED_PAYMENT_METHODS = Set.of(
            "UPI", "CARD", "BANK_TRANSFER", "CASH", "OTHER"
    );

    private final TransactionRepository transactionRepository;
    private final FraudAlertRepository fraudAlertRepository;
    private final FraudEngineService fraudEngineService;

    public CsvUploadService(TransactionRepository transactionRepository,
                            FraudAlertRepository fraudAlertRepository,
                            FraudEngineService fraudEngineService) {
        this.transactionRepository = transactionRepository;
        this.fraudAlertRepository = fraudAlertRepository;
        this.fraudEngineService = fraudEngineService;
    }

    public CsvUploadResponse processCsv(MultipartFile file, String userId) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Please upload a CSV file");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".csv")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only CSV files are allowed");
        }

        int importedTransactions = 0;
        int fraudAlerts = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT
                     .builder()
                     .setHeader()
                     .setSkipHeaderRecord(true)
                     .setIgnoreHeaderCase(true)
                     .setTrim(true)
                     .build())) {

            int rowCount = 0;
            for (CSVRecord record : csvParser) {
                if (rowCount >= 1000) {
                    break;
                }
                rowCount++;

                // 1. Amount
                String amountStr = record.isMapped("amount") ? record.get("amount") : null;
                if (amountStr == null || amountStr.isBlank()) {
                    continue;
                }

                double amount;
                try {
                    amount = Double.parseDouble(amountStr);
                } catch (NumberFormatException e) {
                    continue;
                }

                if (!Double.isFinite(amount) || amount <= 0 || amount > 10000000) {
                    continue;
                }

                // 2. Location
                String location = record.isMapped("location") ? record.get("location") : null;
                if (location == null || location.isBlank() || location.length() > 100) {
                    continue;
                }

                // 3. Device
                String device = record.isMapped("device") ? record.get("device") : null;
                if (device == null || device.isBlank() || device.length() > 100) {
                    continue;
                }

                // 4. Payment Method
                String paymentMethod = "OTHER";
                if (record.isMapped("paymentMethod")) {
                    String pm = record.get("paymentMethod");
                    if (pm != null && !pm.isBlank()) {
                        String upper = pm.trim().toUpperCase();
                        if (ALLOWED_PAYMENT_METHODS.contains(upper)) {
                            paymentMethod = upper;
                        }
                    }
                }

                // 5. Merchant
                String merchant = "Unknown";
                if (record.isMapped("merchant")) {
                    String m = record.get("merchant");
                    if (m != null && !m.isBlank()) {
                        if (m.length() > 150) {
                            continue;
                        }
                        merchant = m.trim();
                    }
                }

                // 6. Transaction Time
                Instant transactionTime = Instant.now();
                if (record.isMapped("transactionTime")) {
                    String timeStr = record.get("transactionTime");
                    if (timeStr != null && !timeStr.isBlank()) {
                        try {
                            Instant parsed = Instant.parse(timeStr.trim());
                            if (parsed.isAfter(Instant.now().plus(5, ChronoUnit.MINUTES))) {
                                continue;
                            }
                            transactionTime = parsed;
                        } catch (DateTimeParseException e) {
                            try {
                                java.time.LocalDateTime ldt = java.time.LocalDateTime.parse(timeStr.trim());
                                Instant parsed = ldt.atZone(java.time.ZoneId.systemDefault()).toInstant();
                                if (parsed.isAfter(Instant.now().plus(5, ChronoUnit.MINUTES))) {
                                    continue;
                                }
                                transactionTime = parsed;
                            } catch (Exception ex) {
                                continue;
                            }
                        }
                    }
                }

                // Save Transaction
                Transaction transaction = new Transaction();
                transaction.setUserId(userId);
                transaction.setAmount(amount);
                transaction.setCurrency("INR");
                transaction.setPaymentMethod(paymentMethod);
                transaction.setMerchant(merchant);
                transaction.setSource("CSV");
                transaction.setLocation(location.trim());
                transaction.setDevice(device.trim());
                transaction.setTransactionTime(transactionTime);
                transaction.setStatus("COMPLETED");

                Transaction savedTransaction = transactionRepository.save(transaction);
                importedTransactions++;

                // Fraud Analysis
                try {
                    FraudAnalysisResult fraudResult = fraudEngineService.checkTransaction(savedTransaction);
                    if (fraudResult.getRiskScore() >= 30) {
                        try {
                            FraudAlert alert = new FraudAlert(
                                    userId,
                                    savedTransaction.getId(),
                                    fraudResult.getRiskScore(),
                                    fraudResult.getRiskLevel(),
                                    fraudResult.getPriority(),
                                    fraudResult.getReasons()
                            );
                            fraudAlertRepository.save(alert);
                            fraudAlerts++;
                        } catch (Exception ignored) {
                        }
                    }
                } catch (Exception ignored) {
                }
            }

        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unable to read CSV file");
        }

        return new CsvUploadResponse("CSV uploaded successfully", importedTransactions, fraudAlerts);
    }
}

