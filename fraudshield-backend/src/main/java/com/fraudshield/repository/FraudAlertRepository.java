package com.fraudshield.repository;

import com.fraudshield.model.FraudAlert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface FraudAlertRepository extends MongoRepository<FraudAlert, String> {

    List<FraudAlert> findByUserIdOrderByCreatedAtDesc(String userId);

    Optional<FraudAlert> findByTransactionId(String transactionId);

    Optional<FraudAlert> findByTransactionIdAndUserId(String transactionId, String userId);

    Optional<FraudAlert> findByIdAndUserId(String id, String userId);

    List<FraudAlert> findAllByOrderByCreatedAtDesc();

    List<FraudAlert> findTop5ByOrderByCreatedAtDesc();

    long countByStatus(String status);

    long countByRiskLevel(String riskLevel);

    long countByRiskLevelIn(Collection<String> riskLevels);

    long countByRiskLevelAndStatus(String riskLevel, String status);

    long countByRiskLevelInAndStatus(Collection<String> riskLevels, String status);
}
