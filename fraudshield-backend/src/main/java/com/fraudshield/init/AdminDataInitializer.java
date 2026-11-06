package com.fraudshield.init;

import com.fraudshield.model.User;
import com.fraudshield.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminDataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminDataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminDataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            String adminEmail = "admin@fraudshield.com";
            if (!userRepository.existsByEmail(adminEmail)) {
                User admin = new User(
                        "FraudShield Admin",
                        adminEmail,
                        passwordEncoder.encode("Admin@12345"),
                        "ADMIN"
                );
                userRepository.save(admin);
                logger.info("Default admin account created successfully: {}", adminEmail);
            } else {
                logger.info("Admin account already exists: {}", adminEmail);
            }
        } catch (Exception e) {
            logger.warn("Could not seed default admin user (Database may be connecting or unavailable): {}", e.getMessage());
        }
    }
}
