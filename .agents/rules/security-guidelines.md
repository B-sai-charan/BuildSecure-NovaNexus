# FinTrack Security Guidelines & Mandatory Constraints

These rules and architectural constraints are strictly enforced across all code, database queries, authentication flows, and API endpoints for FinTrack in compliance with **OWASP ASVS (Application Security Verification Standard)** and **NIST SP 800-63B (Digital Identity Guidelines)**.

---

## 1. Owner-Scoped Database Access (Broken Object Level Authorization / IDOR Defense)
- **Mandatory Filter**: Every database query fetching, mutating, updating, or deleting user-owned resources must include an explicit user ownership filter:
  ```typescript
  // Required pattern:
  where: { id: resourceId, userId: authenticatedUserId }
  ```
- **Never trust client-supplied user identifiers**: Always extract `userId` from the verified JWT payload (`req.user.id`), never from query parameters or request bodies.
- **Cascade Deletion & Referential Integrity**: Ensure foreign keys and cascaded actions respect tenancy and user scoping.

---

## 2. Password Storage & Hashing (NIST SP 800-63B Compliance)
- **Algorithm & Cost**: Passwords must be hashed using `bcrypt` (or `argon2id`) with a work factor / salt rounds of **at least 12** (`SALT_ROUNDS >= 12`).
- **Pre-hashing Validation**: Passwords must meet NIST SP 800-63B criteria (minimum length of 12+ characters, checked against common passwords, no truncation).
- **Zero Plaintext Exposure**: Plaintext passwords must never be logged, cached, transmitted unencrypted, or stored in memory longer than necessary.

---

## 3. Cryptography & Sensitive Data at Rest (AI API Key Protection)
- **Algorithm**: Sensitive credentials (such as user-provided AI API keys, OAuth tokens, financial credentials) must be encrypted at rest using authenticated symmetric encryption: **AES-256-GCM**.
- **Cryptographic Requirements**:
  - A unique, cryptographically random **Initialization Vector (IV)** (minimum 12 bytes / 96 bits) generated per encryption operation.
  - An **Authentication Tag** (16 bytes / 128 bits) generated and verified on every decryption operation to prevent ciphertext tampering.
  - Master encryption keys (`ENCRYPTION_KEY`) must be 32 bytes (256 bits), loaded exclusively via environment variables, and never hardcoded.
- **Frontend Isolation**: Decrypted API keys and secrets must **NEVER** be sent to the frontend or exposed in API response bodies or telemetry.

---

## 4. Session & Token Management (JWT Security)
- **Token Lifespan**: Access tokens (JWT) must be strictly short-lived with an expiration of **maximum 15 minutes** (`expiresIn: '15m'`).
- **Signature Verification**: Every protected route must verify the cryptographic signature using a strong secret (`JWT_SECRET`) and validate token expiration and issuer.
- **Refresh Token Rotation**: If refresh tokens are implemented, they must be stored securely (HTTP-only, Secure, SameSite=Strict cookies) with single-use revocation on rotation.
- **Revocation / Blacklist**: Token payload must not store sensitive PII or unencrypted keys.

---

## 5. Input Validation, Sanitization & Schema Enforcement
- **Strict Schema Validation**: 100% of incoming request payloads (`req.body`, `req.query`, `req.params`) must be validated against strict **Zod** (or Joi) schemas prior to execution in route handlers/controllers.
- **Fail Fast & Safe**: Requests with missing, malformed, or extra unauthorized fields must be rejected immediately with HTTP 400 Bad Request.
- **Output Encoding & Sanitization**: Sanitize outputs to mitigate Cross-Site Scripting (XSS) and injection vectors.

---

## 6. Audit Logging & Git Trail
- All security-relevant actions (authentication attempts, authorization failures, encryption errors, credential updates) must be recorded in audit logs with accurate timestamps and sanitized metadata.
- No secrets, tokens, or plaintext sensitive data may appear in commit messages, diffs, or repository files.
