package com.fraudshield.service;

import com.fraudshield.dto.FraudAnalysisResult;
import com.fraudshield.model.Transaction;
import com.fraudshield.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class FraudEngineServiceTest {

    private FraudEngineService fraudEngineService;
    private TransactionRepository transactionRepository;

    @BeforeEach
    void setUp() {
        transactionRepository = Mockito.mock(TransactionRepository.class);
        fraudEngineService = new FraudEngineService(transactionRepository);
    }

    private Instant createTimeWithHour(int hour) {
        return ZonedDateTime.now(ZoneId.systemDefault())
                .withHour(hour)
                .withMinute(30)
                .withSecond(0)
                .withNano(0)
                .toInstant();
    }

    @Test
    @DisplayName("Normal transaction should have score 0 and LOW risk level")
    void testNormalTransaction() {
        Instant midday = createTimeWithHour(14); // 2:30 PM (normal hour)

        List<Transaction> previous = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            Transaction t = new Transaction();
            t.setId("prev-" + i);
            t.setUserId("user-1");
            t.setAmount(1000.0);
            t.setDevice("iPhone-15");
            t.setLocation("Mumbai");
            t.setTransactionTime(midday.minus(i, ChronoUnit.DAYS));
            previous.add(t);
        }

        Transaction current = new Transaction();
        current.setId("curr-1");
        current.setUserId("user-1");
        current.setAmount(1200.0); // Within normal range
        current.setDevice("iPhone-15"); // Known device
        current.setLocation("Mumbai"); // Known location
        current.setTransactionTime(midday); // Normal hour

        FraudAnalysisResult result = fraudEngineService.evaluateRules(current, previous);

        assertEquals(0, result.getRiskScore());
        assertEquals("LOW", result.getRiskLevel());
        assertEquals("LOW", result.getPriority());
        assertTrue(result.getReasons().isEmpty());
    }

    @Test
    @DisplayName("Rule 1: Amount significantly higher than average should add 25 points")
    void testAmountAnomaly() {
        Instant midday = createTimeWithHour(14);

        List<Transaction> previous = new ArrayList<>();
        for (int i = 1; i <= 3; i++) {
            Transaction t = new Transaction();
            t.setId("prev-" + i);
            t.setUserId("user-1");
            t.setAmount(1000.0); // Avg = 1000
            t.setDevice("iPhone-15");
            t.setLocation("Delhi");
            t.setTransactionTime(midday.minus(i, ChronoUnit.DAYS));
            previous.add(t);
        }

        Transaction current = new Transaction();
        current.setId("curr-1");
        current.setUserId("user-1");
        current.setAmount(5000.0); // > 3x average (1000 * 3 = 3000)
        current.setDevice("iPhone-15");
        current.setLocation("Delhi");
        current.setTransactionTime(midday);

        FraudAnalysisResult result = fraudEngineService.evaluateRules(current, previous);

        assertEquals(25, result.getRiskScore());
        assertEquals("LOW", result.getRiskLevel());
        assertTrue(result.getReasons().contains("Transaction amount is significantly higher than the user's previous average"));
    }

    @Test
    @DisplayName("Rule 2: New device should add 20 points")
    void testNewDeviceAnomaly() {
        Instant midday = createTimeWithHour(14);

        List<Transaction> previous = new ArrayList<>();
        Transaction t = new Transaction();
        t.setId("prev-1");
        t.setUserId("user-1");
        t.setAmount(1000.0);
        t.setDevice("MacBook-Pro");
        t.setLocation("Delhi");
        t.setTransactionTime(midday.minus(1, ChronoUnit.DAYS));
        previous.add(t);

        Transaction current = new Transaction();
        current.setId("curr-1");
        current.setUserId("user-1");
        current.setAmount(1000.0);
        current.setDevice("Unknown-Android-Phone"); // Brand new device
        current.setLocation("Delhi");
        current.setTransactionTime(midday);

        FraudAnalysisResult result = fraudEngineService.evaluateRules(current, previous);

        assertEquals(20, result.getRiskScore());
        assertTrue(result.getReasons().contains("Transaction was made from a new device"));
    }

    @Test
    @DisplayName("Rule 3: New location should add 20 points")
    void testNewLocationAnomaly() {
        Instant midday = createTimeWithHour(14);

        List<Transaction> previous = new ArrayList<>();
        Transaction t = new Transaction();
        t.setId("prev-1");
        t.setUserId("user-1");
        t.setAmount(1000.0);
        t.setDevice("Laptop");
        t.setLocation("Delhi");
        t.setTransactionTime(midday.minus(1, ChronoUnit.DAYS));
        previous.add(t);

        Transaction current = new Transaction();
        current.setId("curr-1");
        current.setUserId("user-1");
        current.setAmount(1000.0);
        current.setDevice("Laptop");
        current.setLocation("Moscow"); // Brand new location
        current.setTransactionTime(midday);

        FraudAnalysisResult result = fraudEngineService.evaluateRules(current, previous);

        assertEquals(20, result.getRiskScore());
        assertTrue(result.getReasons().contains("Transaction occurred from a new location"));
    }

    @Test
    @DisplayName("Rule 4: Unusual hours (e.g. 2 AM) should add 10 points")
    void testUnusualHoursAnomaly() {
        Instant lateNight = createTimeWithHour(2); // 2:30 AM

        List<Transaction> previous = new ArrayList<>();
        Transaction t = new Transaction();
        t.setId("prev-1");
        t.setUserId("user-1");
        t.setAmount(500.0);
        t.setDevice("Laptop");
        t.setLocation("Delhi");
        t.setTransactionTime(lateNight.minus(1, ChronoUnit.DAYS));
        previous.add(t);

        Transaction current = new Transaction();
        current.setId("curr-1");
        current.setUserId("user-1");
        current.setAmount(500.0);
        current.setDevice("Laptop");
        current.setLocation("Delhi");
        current.setTransactionTime(lateNight);

        FraudAnalysisResult result = fraudEngineService.evaluateRules(current, previous);

        assertEquals(10, result.getRiskScore());
        assertTrue(result.getReasons().contains("Transaction occurred during unusual hours"));
    }

    @Test
    @DisplayName("Rule 5: High frequency (>= 3 in last 10 minutes) should add 15 points")
    void testHighFrequencyAnomaly() {
        Instant midday = createTimeWithHour(14);

        List<Transaction> previous = new ArrayList<>();
        // Add 3 transactions within the last 10 minutes
        for (int i = 1; i <= 3; i++) {
            Transaction t = new Transaction();
            t.setId("prev-" + i);
            t.setUserId("user-1");
            t.setAmount(500.0);
            t.setDevice("Laptop");
            t.setLocation("Delhi");
            t.setTransactionTime(midday.minus(i * 2, ChronoUnit.MINUTES)); // 2, 4, 6 mins ago
            previous.add(t);
        }

        Transaction current = new Transaction();
        current.setId("curr-1");
        current.setUserId("user-1");
        current.setAmount(500.0);
        current.setDevice("Laptop");
        current.setLocation("Delhi");
        current.setTransactionTime(midday);

        FraudAnalysisResult result = fraudEngineService.evaluateRules(current, previous);

        assertEquals(15, result.getRiskScore());
        assertTrue(result.getReasons().contains("Multiple transactions occurred within a short time period"));
    }

    @Test
    @DisplayName("Cumulative scoring: All 5 rules fire, score capped at 90 with CRITICAL risk")
    void testCumulativeRulesAndCapping() {
        Instant lateNight = createTimeWithHour(3); // 3:30 AM (+10)

        List<Transaction> previous = new ArrayList<>();
        // 3 recent transactions within 10 minutes (+15) with avg amount 500
        for (int i = 1; i <= 3; i++) {
            Transaction t = new Transaction();
            t.setId("prev-" + i);
            t.setUserId("user-1");
            t.setAmount(500.0);
            t.setDevice("Laptop");
            t.setLocation("Delhi");
            t.setTransactionTime(lateNight.minus(i * 2, ChronoUnit.MINUTES));
            previous.add(t);
        }

        Transaction current = new Transaction();
        current.setId("curr-1");
        current.setUserId("user-1");
        current.setAmount(50000.0); // Amount anomaly: > 3x avg (+25)
        current.setDevice("Brand-New-Device"); // New device (+20)
        current.setLocation("Unknown-City"); // New location (+20)
        current.setTransactionTime(lateNight); // Unusual hour (+10)
        // High frequency (+15)
        // Raw score sum: 25 + 20 + 20 + 10 + 15 = 90

        FraudAnalysisResult result = fraudEngineService.evaluateRules(current, previous);

        assertEquals(90, result.getRiskScore());
        assertEquals("CRITICAL", result.getRiskLevel());
        assertEquals("CRITICAL", result.getPriority());
        assertEquals(5, result.getReasons().size());
    }
}

