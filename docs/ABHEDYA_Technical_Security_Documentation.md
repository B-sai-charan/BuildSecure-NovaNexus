# ABHEDYA — Build Secure 24 Technical & Security Documentation

**Event:** Build Secure 24 — 24-Hour Inter-College Secure Software Engineering Hackathon  
**Organized By:** Abhedya — VBIT Cybersecurity Forum, Vignana Bharathi Institute of Technology, Hyderabad  
**Team Name:** NovaNexus  
**Team ID:** 22  
**Project Name:** FinTrack — Zero-Trust Personal Financial Intelligence & Asset Vault  
**Primary Track / Domain:** Cybersecurity / Secure FinTech  
**GitHub Repository:** [https://github.com/B-sai-charan/BuildSecure-NovaNexus](https://github.com/B-sai-charan/BuildSecure-NovaNexus)  

---

## 1. Project Overview

### 1.1 Problem Statement & Background
Modern personal finance applications present severe attack surfaces. They regularly suffer from Broken Object Level Authorization (BOLA/IDOR), plaintext third-party API credential exposure, unencrypted cloud database persistence, credential stuffing, and insecure session storage. Users are forced to entrust their raw API keys and granular income and expenditure logs to multi-tenant servers that are vulnerable to insider threats, rogue database administrators, and automated scraping.

### 1.2 The FinTrack Solution
**FinTrack** is an enterprise-grade, Zero-Trust Financial Intelligence & Asset Tracking platform engineered with **Security by Design** in strict compliance with **OWASP ASVS (Application Security Verification Standard 4.0 Level 2/3)** and **NIST SP 800-63B (Digital Identity Guidelines)**. 

FinTrack combines owner-scoped database persistence, short-lived JWT authentication, symmetric **AES-256-GCM (AEAD)** encryption for BYO-AI credentials, and an isolated React dashboard. It delivers automated spending synthesis without ever exposing user secrets to client browsers or persistent database logs.

---

## 2. Team Roles & Contributions

NovaNexus (Team 22) is composed of 4 registered software & cybersecurity engineers, dividing responsibilities into distinct security domains:

| Team Member | Role | Key Secure Engineering Responsibilities |
| :--- | :--- | :--- |
| **Sai Charan Boga**<br>`bsaicharan52@gmail.com` | **Lead Cryptographic & Backend Architect** | • Designed AES-256-GCM encryption engine with 96-bit IV and 128-bit Auth Tag validation.<br>• Architected owner-scoped Prisma ORM queries and multi-tenant isolation.<br>• Implemented Bcrypt (Salt rounds = 12) and JWT token rotation pipelines. |
| **Aila Pranathi**<br>`pranathigoud8317@gmail.com` | **Frontend Security & UI/UX Engineer** | • Built secure React 18 + Vite frontend with Tailwind CSS glassmorphism UI.<br>• Engineered `sessionStorage` token isolation to mitigate persistent XSS vulnerabilities.<br>• Implemented real-time NIST SP 800-63B password complexity validators and AuthGuards. |
| **Dheekshita Adupa**<br>`dheekshita3003@gmail.com` | **API Security & Validation Engineer** | • Designed 100% strict Zod input validation schemas across all REST endpoints.<br>• Implemented IP-based `express-rate-limit` brute-force defenses on auth routes.<br>• Integrated Helmet CSP headers, CORS policies, and zero-leakage error handling. |
| **Amirishetty Harsha**<br>`harshaamirishetty@gmail.com` | **Security QA & Audit Engineer** | • Authored automated database seeder and test harness.<br>• Conducted SAST vulnerability reviews, IDOR penetration test cases, and auth timing attack tests.<br>• Maintained deployment configurations, environment hygiene, and compliance audit logs. |

---

## 3. Project Workflow

The end-to-end user and data lifecycle is governed by zero-trust boundaries:

```
+---------------------------------------------------------------------------------------------------+
| 1. Registration & NIST Validation                                                                 |
|    User registers -> NIST SP 800-63B regex check -> Bcrypt hash (Salt 12) -> Saved to PostgreSQL |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
| 2. Authentication & Session Initiation                                                            |
|    Rate-limited login -> Constant-time verification -> Short-lived JWT (15m) -> sessionStorage    |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
| 3. Owner-Scoped Ledger Operations                                                                 |
|    AuthGuard / Axios Interceptor -> JWT verification -> req.user.id bound -> where: { id, userId }|
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
| 4. BYO-AI Key Ingestion & AES-256-GCM Storage                                                     |
|    Raw Key -> Server-side AES-256-GCM (IV + AuthTag) -> PostgreSQL (No raw key in DB or frontend) |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
| 5. In-Memory AI Synthesis & Disclaimer Enforcement                                                |
|    Fetch monthly tx -> Decrypt key in memory -> Server-to-Server AI query -> Append Disclaimer    |
+---------------------------------------------------------------------------------------------------+
```

---

## 4. Technical Architecture

- **Client Tier (Frontend)**: React 18, Vite, Tailwind CSS, Recharts, Lucide React, Axios. Configured with strict `sessionStorage` credential isolation and `AuthGuard` route wrappers.
- **Server Tier (Backend)**: Node.js, Express.js. Protected with `helmet` security headers, strict CORS whitelisting, 100kb payload caps, IP rate-limiting, and centralized error sanitization.
- **Persistence & Data Tier**: PostgreSQL with Prisma ORM. Foreign key cascade deletion, relational indexes on `[userId]`, and database-level unique constraints.
- **Cryptographic Subsystem**: Node.js native `crypto` module implementing AES-256-GCM authenticated symmetric ciphering with 32-byte master key separation.
- **Deployment Platform**: Ready for decoupled deployment on Vercel (Client) and Render / Railway (Server & PostgreSQL) with continuous GitHub CI/CD integration.

---

## 5. Key Features & Implementation

1. **Owner-Scoped Transaction Ledger**: Complete Income and Expense tracking with category tagging, search, and date-range filters.
2. **Interactive Visual Telemetry**: Recharts dynamic Area and Pie charts displaying cashflow trajectories, expense distributions, and monthly savings rates.
3. **Encrypted BYO-AI Vault**: Support for Google Gemini and OpenAI API keys encrypted at rest without client exposure.
4. **Autonomous AI Financial Hygiene Advisor**: In-memory analytical spending synthesis with mandatory financial disclaimers.
5. **Data Sovereignty & Portability**: Instant offline export of all owner-scoped records into formatted JSON and CSV files.
6. **Live NIST Password Checklist**: Real-time visual feedback on password complexity criteria during registration.

---

## 6. Security Implementation & Defense-in-Depth

### 6.1 AES-256-GCM BYO-AI Architecture (Zero DBA Exposure)
- Symmetric encryption utilizes **AES-256-GCM (AEAD)**.
- Every encryption operation generates a unique cryptographically random 12-byte (96-bit) Initialization Vector (`iv`) and produces a 16-byte (128-bit) Authentication Tag (`authTag`).
- The 256-bit `ENCRYPTION_KEY` is isolated to the server environment and is never stored in the database.
- Any unauthorized tampering with database ciphertext fails the Auth Tag check during decryption, immediately halting execution.

### 6.2 OWASP ASVS Alignment
- **V2 (Authentication)**: NIST SP 800-63B compliant password rules; bcrypt salt rounds = 12; timing attack resistance.
- **V3 (Session Management)**: Short-lived access tokens (15-minute expiration); `sessionStorage` client isolation.
- **V4 (Access Control)**: 100% of Prisma queries are owner-scoped (`where: { id, userId }`), preventing Broken Object Level Authorization (IDOR).
- **V5 (Input Validation)**: 100% of request payloads are strictly validated using Zod schemas with fail-fast 400 Bad Request responses.
- **V6 (Cryptography)**: Standardized algorithms only; zero hardcoded secrets; secure key derivation.
- **V13 (API Security)**: IP rate-limiting on sensitive endpoints (5 reqs / 15m) using `express-rate-limit`.

---

## 7. Testing & Validation

Below are 5 concrete security verification test cases executed on the FinTrack codebase:

| Test ID | Security Control Tested | Attack / Test Scenario | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-001** | **IDOR / BOLA Prevention** | Authenticated User A attempts `DELETE /api/transactions/:id` targeting User B's transaction ID. | Server queries `where: { id, userId: req.user.id }`, finds no match, and returns `404 Not Found / Access Denied`. | 404 Access Denied returned; User B's record remains untouched. | `PASSED` |
| **SEC-002** | **Credential Stuffing Rate Limiting** | Automated script sends 10 consecutive failed login attempts within 1 minute from the same IP. | First 5 requests processed; 6th request blocked with `429 Too Many Requests (Rate limit exceeded)`. | HTTP 429 triggered on 6th request with 15-minute lock. | `PASSED` |
| **SEC-003** | **AES-256-GCM Ciphertext Tampering** | Database column `aiKeyEncrypted` has 1 byte modified directly in storage; `POST /api/ai/generate` is triggered. | `decipher.setAuthTag()` verification fails during `decipher.final()`; server returns `500 Cryptographic Auth Tag Failure`. | Auth tag mismatch caught; zero plaintext leaked. | `PASSED` |
| **SEC-004** | **NIST Password Policy Enforcement** | User attempts registration with password `WeakPass1!`, which is 10 characters long (&lt; 12). | Zod validator rejects payload with `400 Validation Error: Password must be at least 12 characters`. | Blocked client-side and server-side with HTTP 400. | `PASSED` |
| **SEC-005** | **Expired JWT Session Rejection** | Request sent to `/api/transactions` using a JWT token generated &gt; 15 minutes ago. | Auth middleware detects `TokenExpiredError` and returns `401 Token Expired`, prompting client re-authentication. | HTTP 401 returned; client auto-redirected to `/login?expired=true`. | `PASSED` |

---

## 8. Deployment & Final Validation

- **Repository**: [https://github.com/B-sai-charan/BuildSecure-NovaNexus](https://github.com/B-sai-charan/BuildSecure-NovaNexus)
- **Branch**: `main`
- **Audit Logs**: Maintained turn-by-turn in [`docs/logs.txt`](docs/logs.txt) with timestamps and Git commit SHAs.
- **Environment Parity**: Zero hardcoded secrets; configuration loaded via `.env` templates.

---

## 9. Final Summary

**FinTrack** establishes a new baseline for secure fintech software engineering in 24-hour hackathon settings. By combining NIST SP 800-63B identity standards, authenticated AES-256-GCM cryptographic storage for BYO-AI credentials, owner-scoped database scoping, and short-lived session management, Team **NovaNexus (Team 22)** delivers a production-ready application where security is not an afterthought, but the core foundation of every architectural layer.
