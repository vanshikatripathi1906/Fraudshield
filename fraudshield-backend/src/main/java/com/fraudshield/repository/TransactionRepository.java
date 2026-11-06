package com.fraudshield.repository;

import com.fraudshield.model.Transaction;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends MongoRepository<Transaction, String> {

    List<Transaction> findTop100ByUserIdOrderByTransactionTimeDesc(String userId);

    List<Transaction> findTop100ByUserIdAndIdNotOrderByTransactionTimeDesc(String userId, String id);

    Optional<Transaction> findByIdAndUserId(String id, String userId);

    List<Transaction> findByUserId(String userId);
}
