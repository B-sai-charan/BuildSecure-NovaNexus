# FinTrack Server (Backend)

## Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM & Database**: Prisma ORM with PostgreSQL
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate-Limiter, Bcrypt, AES-256-GCM, JsonWebToken

## Security Mandates (OWASP ASVS & NIST SP 800-63B)
1. **Owner-Scoped Queries**: All database queries must enforce `{ id, userId }` scoping.
2. **Password Hashing**: Bcrypt with Salt Rounds >= 12.
3. **Key Encryption at Rest**: AES-256-GCM with unique IV per record and Auth Tag verification.
4. **JWT Expiry**: 15 minutes short-lived tokens with cryptographic signature verification.
5. **Strict Input Validation**: Zod schema validation on 100% of API endpoints.
