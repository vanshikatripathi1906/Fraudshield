package com.fraudshield.controller;

import com.fraudshield.dto.TransactionRequest;
import com.fraudshield.dto.TransactionResponse;
import com.fraudshield.model.Transaction;
import com.fraudshield.security.UserPrincipal;
import com.fraudshield.service.TransactionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getTransactions(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Transaction> transactions = transactionService.getTransactions(userPrincipal.getId());
        Map<String, Object> response = new HashMap<>();
        response.put("transactions", transactions);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getTransaction(
            @PathVariable("id") String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Map<String, Object> details = transactionService.getTransactionDetails(id, userPrincipal.getId());
        return ResponseEntity.ok(details);
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @RequestBody TransactionRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        TransactionResponse response = transactionService.createTransaction(request, userPrincipal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}

