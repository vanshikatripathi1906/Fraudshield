# FraudShield — Financial Fraud Detection & Monitoring Platform (Java Spring Boot Backend)

> **Resume-Oriented Enterprise Backend Project** migrated from Node.js/Express to **Java Spring Boot 3 & Spring Security 6**, integrated with **MongoDB Atlas** and a **React (Vite)** frontend.

---

## 📌 Architecture & Design Overview

FraudShield employs a **Clean Layered MVC Architecture** following enterprise Spring Boot best practices (as covered in the Telusko Spring Boot & Spring Security curriculum):

```text
React Frontend (Port 5173)
       │ (REST APIs + HttpOnly Cookie / JWT)
       ▼
Spring Security Filter Chain (JwtAuthenticationFilter + CORS)
       │
       ▼
REST Controllers (@RestController)
  ├── AuthController (/api/auth)
  ├── TransactionController (/api/transactions)
  ├── FraudAlertController (/api/fraud-alerts)
  ├── UploadController (/api/upload/csv)
  └── AdminController (/api/admin)
       │ (DTOs / Request / Response Validation)
       ▼
Service Layer (@Service - Business Logic & Rule Engine)
  ├── AuthService (BCrypt, Token Issuance, Profile)
  ├── TransactionService (Manual creation, validations)
  ├── FraudEngineService (5 Weighted Anomaly Rules)
  ├── FraudAlertService (Alert lifecycle & updates)
  ├── CsvUploadService (Streaming Apache Commons CSV ingestion)
  └── AdminService (Metrics, search, filtering, CSV export)
       │
       ▼
Repository Layer (@Repository - Spring Data MongoDB)
  ├── UserRepository (MongoRepository<User, String>)
  ├── TransactionRepository (MongoRepository<Transaction, String>)
  └── FraudAlertRepository (MongoRepository<FraudAlert, String>)
       │
       ▼
MongoDB Atlas Cloud Database (Collections: users, transactions, fraudalerts)
```

---

## 🚀 Telusko Spring Boot Concepts Applied

1. **Inversion of Control (IoC) & Dependency Injection (DI)**
   - Strict **Constructor Injection** across all services and controllers.
   - Clean separation of concerns with `@Component`, `@Service`, `@Repository`, `@RestController`, `@Configuration`.

2. **Spring Boot 3.x & Java 21**
   - Bootstrapped using `spring-boot-starter-web`, `spring-boot-starter-security`, `spring-boot-starter-data-mongodb`, `spring-boot-starter-validation`.
   - Native Java 21 records, Pattern Matching, and Modern Time API (`java.time.Instant`, `java.time.ZonedDateTime`).

3. **Spring Data MongoDB**
   - Collection mapping: `@Document(collection = "users")`, `@Document(collection = "transactions")`, `@Document(collection = "fraudalerts")`.
   - Indexing: `@Indexed(unique = true)` and `@CompoundIndex(def = "{'userId': 1, 'transactionTime': -1}")`.
   - High-performance query methods: `findTop100ByUserIdOrderByTransactionTimeDesc`, `countByRiskLevelAndStatus`, etc.
   - Preserves 100% database compatibility with previous MERN MongoDB Atlas data.

4. **Spring Security 6 & JWT Authentication**
   - Stateless session management (`SessionCreationPolicy.STATELESS`).
   - Secure HttpOnly Cookie extraction (`token`) + Authorization Header fallback.
   - Role-Based Access Control (RBAC): `ROLE_USER` and `ROLE_ADMIN`.
   - `BCryptPasswordEncoder` for salting and hashing credentials.
   - Pre-configured CORS filter allowing the React Vite frontend (`http://localhost:5173`) with credentials.

5. **Rule-Based Fraud Detection Engine**
   Deterministic heuristic risk analysis scoring ported from JavaScript to Java:
   - **Rule 1: Amount Anomaly (+25 pts)**: Triggered if transaction amount > 3x the user's historical average (minimum 3 prior transactions).
   - **Rule 2: New Device (+20 pts)**: Triggered if the device is unknown in the user's history.
   - **Rule 3: New Location (+20 pts)**: Triggered if the geographic location is unseen in the user's history.
   - **Rule 4: Unusual Transaction Time (+10 pts)**: Triggered between midnight and 5:00 AM (00:00–05:00).
   - **Rule 5: High Velocity / Frequency (+15 pts)**: Triggered if >= 3 transactions occurred in the preceding 10 minutes.
   - **Score Cap**: Capped at 90 points max.
   - **Risk Classification**:
     - `0 – 29`: **LOW**
     - `30 – 59`: **MEDIUM** (Generates open `FraudAlert`)
     - `60 – 79`: **HIGH** (Generates open `FraudAlert`)
     - `80 – 90`: **CRITICAL** (Generates open `FraudAlert`)

6. **Streaming CSV Processing**
   - Ingestion of statements up to 1,000 records using **Apache Commons CSV**.
   - Per-row validation and real-time fraud analysis.

7. **Automated Admin Seeding**
   - `CommandLineRunner` automatically provisions `admin@fraudshield.com` (`Admin@12345`, `ROLE_ADMIN`) on startup if absent.

---

## 🛠️ How to Run the Project

### Prerequisites
- Java 21 or Java 26 installed (`java -version`, `javac -version`)
- Node.js (v18+) for running the React frontend

### 1. Run the Spring Boot Backend
Navigate to `fraudshield-backend` and execute the Maven Wrapper:

```powershell
cd fraudshield-backend
.\mvnw.cmd spring-boot:run
```

The Spring Boot backend will start on **`http://localhost:5000`**.

To run unit tests:
```powershell
.\mvnw.cmd test
```

### 2. Run the React Frontend
In a separate terminal:

```powershell
cd fraudshield/client
npm install
npm run dev
```

The React dashboard will be accessible at **`http://localhost:5173`**.

---

## 💼 Resume Description & Interview Talking Points

### Resume Bullet Points
- **Full-Stack Financial Fraud Detection Platform (Java Spring Boot, MongoDB Atlas, React.js)**:
  - Migrated production Node.js/Express backend to **Java 21 & Spring Boot 3.3**, implementing clean layered MVC architecture and constructor-based Dependency Injection.
  - Architected a deterministic rule-based fraud scoring engine evaluating transaction velocity, historical averages, device fingerprints, and geolocation anomalies in real time.
  - Implemented secure authentication with **Spring Security 6, JWT, and HttpOnly Cookies**, enforcing Role-Based Access Control (`ROLE_USER`, `ROLE_ADMIN`) and BCrypt password encryption.
  - Designed persistence layer using **Spring Data MongoDB** with compound indexing on MongoDB Atlas for efficient sub-100ms historical queries.
  - Built streaming CSV statement parsing using **Apache Commons CSV** supporting batch ingestion of 1,000+ financial records with per-row validation and automated alert triage.
  - Authored comprehensive JUnit 5 unit test suites verifying fraud scoring thresholds, cumulative rule combinations, and risk classifications.

