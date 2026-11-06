# FraudShield — Real-Time Financial Fraud Detection & Monitoring Platform

FraudShield is a full-stack, enterprise-grade financial security and fraud monitoring platform. It combines a high-performance **Java 21 & Spring Boot 3.3** backend with a modern **React (Vite)** dashboard and a **MongoDB Atlas** database.

---

## 🏛️ System Architecture

```text
React.js Frontend (Port 5173)
       │ (REST APIs + HttpOnly Cookie / JWT)
       ▼
Spring Security Filter Chain (JwtAuthenticationFilter + CorsConfig)
       │
       ▼
REST Controllers (@RestController)
  ├── AuthController          ──> /api/auth
  ├── TransactionController   ──> /api/transactions
  ├── FraudAlertController    ──> /api/fraud-alerts
  ├── UploadController        ──> /api/upload/csv
  ├── AdminController         ──> /api/admin
  └── RootController          ──> /
       │ (DTOs & Jakarta Validation @Valid)
       ▼
Service Layer (@Service — Business Logic & Rule Engine)
  ├── AuthService             ──> BCrypt hashing, JWT cookie generation
  ├── TransactionService      ──> Validation, velocity & anomaly checking
  ├── FraudEngineService      ──> 5-rule heuristic scoring engine (capped at 90)
  ├── FraudAlertService       ──> Alert lifecycle (OPEN / REVIEWED / DISMISSED)
  ├── CsvUploadService        ──> Apache Commons CSV streaming ingestion
  └── AdminService            ──> Aggregated metrics, search, bulk updates, CSV export
       │
       ▼
Repository Layer (@Repository — Spring Data MongoDB)
  ├── UserRepository          ──> MongoRepository<User, String>
  ├── TransactionRepository   ──> MongoRepository<Transaction, String>
  └── FraudAlertRepository    ──> MongoRepository<FraudAlert, String>
       │
       ▼
MongoDB Atlas Cloud Database (Collections: `users`, `transactions`, `fraudalerts`)
```

---

## 🚀 Key Features

- **Native Java Spring Boot 3 Backend**:
  - Implements clean layered MVC architecture (Controller $\rightarrow$ Service $\rightarrow$ Repository).
  - Strict constructor-based Dependency Injection.
  - Exception handling via `@RestControllerAdvice` returning structured JSON responses.
- **Rule-Based Fraud Detection Engine**:
  - **Amount Anomaly (+25 pts)**: Transaction amount $> 3\times$ previous historical average.
  - **New Device (+20 pts)**: Device fingerprint unrecognized in account history.
  - **New Location (+20 pts)**: Geographic location unrecognized in account history.
  - **Unusual Hours (+10 pts)**: Transactions occurring between 00:00 and 05:00.
  - **High Frequency (+15 pts)**: 3 or more transactions within a 10-minute window.
  - **Score Cap**: Maximum score of 90.
  - **Risk Classification**: `LOW` (0–29), `MEDIUM` (30–59), `HIGH` (60–79), `CRITICAL` (80–90).
- **Spring Security 6 & JWT**:
  - Stateless authentication with JWT stored in secure `HttpOnly` cookies.
  - Role-Based Access Control (`ROLE_USER` and `ROLE_ADMIN`).
  - Passwords salted and hashed with `BCryptPasswordEncoder`.
- **High-Throughput CSV Statement Ingestion**:
  - Streaming file processing using **Apache Commons CSV** supporting batch ingestion of 1,000+ records.
- **Admin Analytics Dashboard**:
  - Real-time fraud metrics, risk distribution, reason frequency analysis, search & filtering, bulk alert triage, and CSV data export.
- **Modern React (Vite) Frontend**:
  - Real-time statistics, responsive alert monitoring, manual transaction entry, and statement upload.

---

## 📂 Project Structure

```text
FraudShield/
├── fraudshield-backend/               # Native Java Spring Boot 3 Backend
│   ├── pom.xml
│   ├── mvnw / mvnw.cmd
│   ├── Dockerfile
│   └── src/
│       ├── main/
│       │   ├── java/com/fraudshield/
│       │   │   ├── FraudShieldApplication.java
│       │   │   ├── config/            # SecurityConfig, CorsConfig
│       │   │   ├── controller/        # Auth, Transaction, FraudAlert, Upload, Admin
│       │   │   ├── dto/               # Request, Response, and Stats DTOs
│       │   │   ├── exception/         # GlobalExceptionHandler, ApiException
│       │   │   ├── init/              # AdminDataInitializer
│       │   │   ├── model/             # User, Transaction, FraudAlert documents
│       │   │   ├── repository/        # MongoRepository interfaces
│       │   │   ├── security/          # JwtTokenProvider, JwtFilter, UserPrincipal
│       │   │   └── service/           # FraudEngine, Auth, Transaction, Admin services
│       │   └── resources/
│       │       └── application.properties
│       └── test/
│           └── java/com/fraudshield/service/FraudEngineServiceTest.java
│
├── client/                            # React.js (Vite) Frontend
│   ├── src/
│   │   ├── components/                # Navbar, ProtectedRoute, Forms, CSVUpload
│   │   ├── pages/                     # Dashboard, Alerts, Admin, Transactions, Auth
│   │   ├── config.js                  # API URL configuration
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
│
└── README.md
```

---

## 🛠️ Quick Start Guide

### Prerequisites
- **Java 21+** (`java -version`, `javac -version`)
- **Node.js (v18+)** & `npm`
- **MongoDB Atlas** connection string

### 1. Run the Spring Boot Backend

```powershell
cd fraudshield-backend
.\mvnw.cmd spring-boot:run
```
*The backend starts at `http://localhost:5000` and automatically provisions the default administrator (`admin@fraudshield.com` / `Admin@12345`).*

To run unit tests:
```powershell
cd fraudshield-backend
.\mvnw.cmd test
```

### 2. Run the React Frontend

```powershell
cd client
npm install
npm run dev
```
*The frontend will run at `http://localhost:5173`.*

---

## 🌐 Deployment Configuration

- **Frontend**: Deploy `client/` to **Vercel** or **Netlify**. Set the environment variable:
  ```env
  VITE_API_URL=https://<your-backend-domain>
  ```
- **Backend**: Deploy `fraudshield-backend/` to **Render**, **Railway**, or any Docker host using the included `Dockerfile`. Set the environment variables:
  ```env
  MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fraudshield
  JWT_SECRET=<your-strong-256-bit-secret>
  CLIENT_URL=https://<your-frontend-domain>
  ```
