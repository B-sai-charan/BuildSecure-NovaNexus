import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function pushDb() {
  console.log('[DB Setup] Creating schema enums and tables on Neon PostgreSQL...');
  
  // 1. Enums
  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
        CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
      END IF;
    END $$;
  `;

  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TransactionType') THEN
        CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');
      END IF;
    END $$;
  `;

  // 2. Users table
  await sql`
    CREATE TABLE IF NOT EXISTS "users" (
      "id" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "passwordHash" TEXT NOT NULL,
      "role" "Role" NOT NULL DEFAULT 'USER',
      "aiKeyEncrypted" TEXT,
      "aiKeyIv" TEXT,
      "aiKeyAuthTag" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "users_pkey" PRIMARY KEY ("id")
    );
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
  `;

  // 3. Transactions table
  await sql`
    CREATE TABLE IF NOT EXISTS "transactions" (
      "id" TEXT NOT NULL,
      "amount" DOUBLE PRECISION NOT NULL,
      "type" "TransactionType" NOT NULL,
      "category" TEXT NOT NULL,
      "description" TEXT,
      "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "userId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS "transactions_userId_idx" ON "transactions"("userId");
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "transactions_userId_date_idx" ON "transactions"("userId", "date");
  `;

  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transactions_userId_fkey') THEN
        ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$;
  `;

  // 4. Budgets table
  await sql`
    CREATE TABLE IF NOT EXISTS "budgets" (
      "id" TEXT NOT NULL,
      "category" TEXT NOT NULL,
      "amountLimit" DOUBLE PRECISION NOT NULL,
      "userId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
    );
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "budgets_userId_category_key" ON "budgets"("userId", "category");
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "budgets_userId_idx" ON "budgets"("userId");
  `;

  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'budgets_userId_fkey') THEN
        ALTER TABLE "budgets" ADD CONSTRAINT "budgets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$;
  `;

  console.log('[DB Setup] All tables, types, indexes, and constraints successfully pushed!');
}

pushDb().catch((err) => {
  console.error('[DB Setup Error]:', err);
  process.exit(1);
});
