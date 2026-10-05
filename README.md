# FinTrack — Zero-Trust Financial Intelligence & Asset Vault

> **ABHEDYA — Build Secure 24 Hackathon (VBIT Cybersecurity Forum)**  
> **Team Name:** NovaNexus | **Team ID:** 22  
> **Repository:** [https://github.com/B-sai-charan/BuildSecure-NovaNexus](https://github.com/B-sai-charan/BuildSecure-NovaNexus)

---

## 1. Project Overview & Security Mandate

**FinTrack** is an enterprise-grade secure personal finance and financial telemetry platform engineered with **Security by Design** in compliance with:
- **OWASP ASVS 4.0 (Level 2/3)**: Broken Object Level Authorization (IDOR) elimination via 100% owner-scoped database queries (`where: { id, userId }`).
- **NIST SP 800-63B**: Strong password complexity verification and authenticated session controls.
- **AES-256-GCM (AEAD)**: Symmetric encryption at rest for Bring-Your-Own AI API keys (Google Gemini / OpenAI) with 96-bit random IVs and 128-bit Auth Tag verification.
- **Defense in Depth**: 15-minute short-lived JWTs, `sessionStorage` XSS isolation, IP rate-limiting, Helmet CSP, and Zod input validation schemas.

---

## 2. Quickstart & Local Evaluation Guide (For Judges)

Follow these steps to run the complete FinTrack monorepo locally.

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: Running locally or a cloud database instance (e.g., Supabase / Neon / Render)

---

### Step 1: Clone and Install Dependencies

```bash
git clone https://github.com/B-sai-charan/BuildSecure-NovaNexus.git
cd BuildSecure-NovaNexus

# Install all monorepo dependencies (client + server)
npm install
```

---

### Step 2: Configure Server Environment Variables

Create the `.env` file in the `server/` directory:

```bash
# Copy example configuration template
cp server/.env.example server/.env
```

Ensure `server/.env` contains valid values:

```env
PORT=5000
NODE_ENV=development

# Database Connection (Replace with your PostgreSQL credentials)
DATABASE_URL="postgresql://postgres:password@localhost:5432/fintrack?schema=public"

# Authentication & Security Secrets
JWT_SECRET="change-me-to-a-secure-random-secret-key-at-least-64-characters-long"
JWT_EXPIRES_IN="15m"

# Symmetric Master Encryption Key (32 bytes / 256-bit hex encoded)
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
ENCRYPTION_MASTER_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# CORS Allowed Origins
CORS_ORIGIN="http://localhost:5173"
```

---

### Step 3: Database Migration & Synthetic Data Seeding

Push the Prisma schema to your PostgreSQL database and run the synthetic data seeder:

```bash
# Generate Prisma client and push schema tables (users, transactions, budgets)
npx prisma db push --schema=server/prisma/schema.prisma

# Seed database with demo user, 30 days of transactions, and category budgets
npm run seed --workspace=server
```

---

### Step 4: Run Development Servers

Start both backend and frontend concurrently:

```bash
# Option A: Start all workspaces simultaneously
npm run dev

# Option B: Run in separate terminals
npm run dev:server   # Starts Express API at http://localhost:5000
npm run dev:client   # Starts Vite React Frontend at http://localhost:5173
```

Open your browser at **`http://localhost:5173`**.

---

## 3. Demo Credentials

For rapid judge evaluation, use the pre-seeded account:

| Field | Value |
| :--- | :--- |
| **Email** | `demo@novanexus.com` |
| **Password** | `SecurePass!123` |
| **Pre-loaded Data** | 10 realistic monthly transactions + 5 category budgets |

---

## 4. Repository Structure

```
├── .agents/
│   └── rules/
│       └── security-guidelines.md  ← Enforced security constraints & OWASP rules
├── client/                         ← React 18 + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── api/axiosConfig.js      ← sessionStorage JWT injection & 401 handling
│   │   ├── components/             ← Navbar, AuthGuard, AiAssistant
│   │   └── pages/                  ← Login, Register, Dashboard, Transactions, Settings
├── server/                         ← Node.js + Express + Prisma Backend
│   ├── prisma/
│   │   ├── schema.prisma           ← Relational PostgreSQL Schema
│   │   └── seed.js                 ← Database Seeder Script
│   └── src/
│       ├── controllers/            ← authController, transactionController, aiController
│       ├── middleware/             ← auth.js (JWT verify), rateLimiter.js (5 req/15m)
│       ├── routes/                 ← authRoutes, transactionRoutes, aiRoutes
│       └── utils/                  ← encryption.js (AES-256-GCM), validators.js (Zod)
├── docs/
│   ├── ABHEDYA_Technical_Security_Documentation.md ← Official Hackathon Security Report
│   ├── APPROACH.md                 ← Problem breakdown & architecture approach
│   └── logs.txt                    ← Autonomous turn-by-turn prompt & file audit log
└── metadata/
    ├── team.yaml                   ← Team 22 (NovaNexus) registration info
    └── submission.yaml             ← Submission metadata
```

---

## 5. Security & Technical Documentation

For the full 9-section technical report, threat model, cryptographic proof, and 5 security test cases, please inspect:
- [**docs/ABHEDYA_Technical_Security_Documentation.md**](docs/ABHEDYA_Technical_Security_Documentation.md)
- [**docs/APPROACH.md**](docs/APPROACH.md)
- [**docs/logs.txt**](docs/logs.txt)
