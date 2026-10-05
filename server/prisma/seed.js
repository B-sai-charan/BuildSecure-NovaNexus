import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const BCRYPT_SALT_ROUNDS = 12;

async function main() {
  console.log('[FinTrack Seeder] Initializing database seeding...');

  const demoEmail = 'demo@novanexus.com';
  const rawPassword = 'SecurePass!123';

  // 1. Clean existing seed data if any for idempotent execution
  const existingUser = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  if (existingUser) {
    console.log(`[FinTrack Seeder] Cleaning prior demo records for ${demoEmail}...`);
    await prisma.user.delete({ where: { id: existingUser.id } });
  }

  // 2. Hash demo user password with bcrypt salt rounds = 12
  const passwordHash = await bcrypt.hash(rawPassword, BCRYPT_SALT_ROUNDS);

  // 3. Create Demo User
  const demoUser = await prisma.user.create({
    data: {
      email: demoEmail,
      passwordHash,
      role: 'USER',
    },
  });

  console.log(`[FinTrack Seeder] Created Demo User: ${demoUser.email} (ID: ${demoUser.id})`);

  // 4. Generate Realistic Synthetic Transactions (Last 30 Days)
  const now = new Date();
  const getPastDate = (daysAgo) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return d;
  };

  const syntheticTransactions = [
    {
      amount: 4850.0,
      type: 'INCOME',
      category: 'Salary & Wages',
      description: 'Monthly Senior Cybersecurity Engineering Compensation',
      date: getPastDate(28),
      userId: demoUser.id,
    },
    {
      amount: 1450.0,
      type: 'EXPENSE',
      category: 'Housing & Rent',
      description: 'Downtown Loft Residential Rent & HOA',
      date: getPastDate(27),
      userId: demoUser.id,
    },
    {
      amount: 184.5,
      type: 'EXPENSE',
      category: 'Food & Groceries',
      description: 'Whole Foods Market Bi-Weekly Groceries',
      date: getPastDate(24),
      userId: demoUser.id,
    },
    {
      amount: 75.0,
      type: 'EXPENSE',
      category: 'Utilities & Bills',
      description: 'Fiber Gigabit Internet Subscription',
      date: getPastDate(20),
      userId: demoUser.id,
    },
    {
      amount: 650.0,
      type: 'INCOME',
      category: 'Investments & Dividends',
      description: 'Quarterly Index Fund & Treasury Yield',
      date: getPastDate(18),
      userId: demoUser.id,
    },
    {
      amount: 120.0,
      type: 'EXPENSE',
      category: 'Transportation & Fuel',
      description: 'EV Supercharger Charging Station',
      date: getPastDate(15),
      userId: demoUser.id,
    },
    {
      amount: 215.3,
      type: 'EXPENSE',
      category: 'Food & Groceries',
      description: 'Trader Joes Organic Restock',
      date: getPastDate(11),
      userId: demoUser.id,
    },
    {
      amount: 45.0,
      type: 'EXPENSE',
      category: 'Tech & Subscriptions',
      description: 'GitHub Copilot & ProtonMail Privacy Suite',
      date: getPastDate(8),
      userId: demoUser.id,
    },
    {
      amount: 1250.0,
      type: 'INCOME',
      category: 'Freelance Consulting',
      description: 'Smart Contract Security Audit Retainer',
      date: getPastDate(5),
      userId: demoUser.id,
    },
    {
      amount: 95.0,
      type: 'EXPENSE',
      category: 'Entertainment & Leisure',
      description: 'Cybersecurity Forum Dinner & Networking',
      date: getPastDate(2),
      userId: demoUser.id,
    },
  ];

  for (const tx of syntheticTransactions) {
    await prisma.transaction.create({ data: tx });
  }

  console.log(`[FinTrack Seeder] Seeded ${syntheticTransactions.length} realistic owner-scoped transactions.`);

  // 5. Seed Default Budgets
  const defaultBudgets = [
    { category: 'Housing & Rent', amountLimit: 1500.0, userId: demoUser.id },
    { category: 'Food & Groceries', amountLimit: 600.0, userId: demoUser.id },
    { category: 'Transportation & Fuel', amountLimit: 250.0, userId: demoUser.id },
    { category: 'Utilities & Bills', amountLimit: 200.0, userId: demoUser.id },
    { category: 'Tech & Subscriptions', amountLimit: 100.0, userId: demoUser.id },
  ];

  for (const b of defaultBudgets) {
    await prisma.budget.create({ data: b });
  }

  console.log(`[FinTrack Seeder] Seeded ${defaultBudgets.length} category budgets.`);
  console.log('[FinTrack Seeder] Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('[FinTrack Seeder Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
