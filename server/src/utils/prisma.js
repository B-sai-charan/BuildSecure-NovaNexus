import dotenv from 'dotenv';
dotenv.config();

import { setGlobalDispatcher, Agent } from 'undici';
import { neon } from '@neondatabase/serverless';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

// Resilient dispatcher configuration with cold-start allowance (30s)
try {
  setGlobalDispatcher(
    new Agent({
      connect: {
        family: 4,
        timeout: 30000,
      },
      pipelining: 0,
      keepAliveTimeout: 60000,
    })
  );
} catch (e) {
  // Ignored if already configured
}

const connectionString = process.env.DATABASE_URL || '';
const globalForPrisma = globalThis;

async function retryQuery(fn, retries = 3) {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (i + 1)));
      }
    }
  }
  throw lastErr;
}

function createDatabaseClient() {
  if (connectionString.includes('neon.tech')) {
    const sql = neon(connectionString);

    return {
      user: {
        findUnique: async ({ where, select }) => {
          return await retryQuery(async () => {
            let rows = [];
            if (where.email) {
              rows = await sql`SELECT * FROM users WHERE email = ${where.email} LIMIT 1;`;
            } else if (where.id) {
              rows = await sql`SELECT * FROM users WHERE id = ${where.id} LIMIT 1;`;
            }
            if (!rows || rows.length === 0) return null;
            const u = rows[0];
            if (select) {
              const result = {};
              for (const k of Object.keys(select)) {
                if (select[k]) result[k] = u[k];
              }
              return result;
            }
            return u;
          });
        },
        create: async ({ data, select }) => {
          return await retryQuery(async () => {
            const id = data.id || randomUUID();
            const role = data.role || 'USER';
            const rows = await sql`
              INSERT INTO users (id, email, "passwordHash", role, "createdAt", "updatedAt")
              VALUES (${id}, ${data.email}, ${data.passwordHash}, ${role}::"Role", NOW(), NOW())
              RETURNING *;
            `;
            const u = rows[0];
            if (select) {
              const result = {};
              for (const k of Object.keys(select)) {
                if (select[k]) result[k] = u[k];
              }
              return result;
            }
            return u;
          });
        },
        update: async ({ where, data }) => {
          return await retryQuery(async () => {
            const rows = await sql`
              UPDATE users
              SET 
                "aiKeyEncrypted" = ${data.aiKeyEncrypted !== undefined ? data.aiKeyEncrypted : null},
                "aiKeyIv" = ${data.aiKeyIv !== undefined ? data.aiKeyIv : null},
                "aiKeyAuthTag" = ${data.aiKeyAuthTag !== undefined ? data.aiKeyAuthTag : null},
                "updatedAt" = NOW()
              WHERE id = ${where.id}
              RETURNING *;
            `;
            return rows[0] || null;
          });
        },
        delete: async ({ where }) => {
          return await retryQuery(async () => {
            const rows = await sql`DELETE FROM users WHERE id = ${where.id} RETURNING *;`;
            return rows[0] || null;
          });
        },
        count: async () => {
          return await retryQuery(async () => {
            const rows = await sql`SELECT COUNT(*)::int as count FROM users;`;
            return rows[0]?.count || 0;
          });
        },
      },
      transaction: {
        findMany: async ({ where = {}, orderBy = { date: 'desc' }, take, skip } = {}) => {
          return await retryQuery(async () => {
            const limitVal = take || 100;
            const offsetVal = skip || 0;
            if (where.userId && where.date?.gte) {
              return await sql`
                SELECT * FROM transactions 
                WHERE "userId" = ${where.userId} AND date >= ${where.date.gte}
                ORDER BY date DESC
                LIMIT ${limitVal} OFFSET ${offsetVal};
              `;
            }
            if (where.userId) {
              return await sql`
                SELECT * FROM transactions 
                WHERE "userId" = ${where.userId}
                ORDER BY date DESC
                LIMIT ${limitVal} OFFSET ${offsetVal};
              `;
            }
            return await sql`SELECT * FROM transactions ORDER BY date DESC LIMIT ${limitVal} OFFSET ${offsetVal};`;
          });
        },
        count: async ({ where = {} } = {}) => {
          return await retryQuery(async () => {
            if (where.userId && where.type) {
              const rows = await sql`SELECT COUNT(*)::int as count FROM transactions WHERE "userId" = ${where.userId} AND type = ${where.type}::"TransactionType";`;
              return rows[0]?.count || 0;
            }
            if (where.userId) {
              const rows = await sql`SELECT COUNT(*)::int as count FROM transactions WHERE "userId" = ${where.userId};`;
              return rows[0]?.count || 0;
            }
            const rows = await sql`SELECT COUNT(*)::int as count FROM transactions;`;
            return rows[0]?.count || 0;
          });
        },
        aggregate: async ({ _sum, where = {} } = {}) => {
          return await retryQuery(async () => {
            let rows;
            if (where.userId && where.type) {
              rows = await sql`SELECT COALESCE(SUM(amount), 0)::float as total FROM transactions WHERE "userId" = ${where.userId} AND type = ${where.type}::"TransactionType";`;
            } else if (where.userId) {
              rows = await sql`SELECT COALESCE(SUM(amount), 0)::float as total FROM transactions WHERE "userId" = ${where.userId};`;
            } else {
              rows = await sql`SELECT COALESCE(SUM(amount), 0)::float as total FROM transactions;`;
            }
            return {
              _sum: {
                amount: rows[0]?.total || 0,
              },
            };
          });
        },
        create: async ({ data }) => {
          return await retryQuery(async () => {
            const id = data.id || randomUUID();
            const date = data.date ? new Date(data.date) : new Date();
            const rows = await sql`
              INSERT INTO transactions (id, amount, type, category, description, date, "userId", "createdAt", "updatedAt")
              VALUES (${id}, ${data.amount}, ${data.type}::"TransactionType", ${data.category}, ${data.description || null}, ${date}, ${data.userId}, NOW(), NOW())
              RETURNING *;
            `;
            return rows[0];
          });
        },
        createMany: async ({ data }) => {
          return await retryQuery(async () => {
            for (const item of data) {
              const id = item.id || randomUUID();
              const date = item.date ? new Date(item.date) : new Date();
              await sql`
                INSERT INTO transactions (id, amount, type, category, description, date, "userId", "createdAt", "updatedAt")
                VALUES (${id}, ${item.amount}, ${item.type}::"TransactionType", ${item.category}, ${item.description || null}, ${date}, ${item.userId}, NOW(), NOW());
              `;
            }
            return { count: data.length };
          });
        },
        findFirst: async ({ where }) => {
          return await retryQuery(async () => {
            const rows = await sql`
              SELECT * FROM transactions
              WHERE id = ${where.id} AND "userId" = ${where.userId}
              LIMIT 1;
            `;
            return rows[0] || null;
          });
        },
        delete: async ({ where }) => {
          return await retryQuery(async () => {
            const rows = await sql`DELETE FROM transactions WHERE id = ${where.id} RETURNING *;`;
            return rows[0] || null;
          });
        },
      },
      budget: {
        findMany: async ({ where = {} } = {}) => {
          return await retryQuery(async () => {
            if (where.userId) {
              return await sql`SELECT * FROM budgets WHERE "userId" = ${where.userId};`;
            }
            return await sql`SELECT * FROM budgets;`;
          });
        },
        create: async ({ data }) => {
          return await retryQuery(async () => {
            const id = data.id || randomUUID();
            const rows = await sql`
              INSERT INTO budgets (id, category, "amountLimit", "userId", "createdAt", "updatedAt")
              VALUES (${id}, ${data.category}, ${data.amountLimit}, ${data.userId}, NOW(), NOW())
              RETURNING *;
            `;
            return rows[0];
          });
        },
        createMany: async ({ data }) => {
          return await retryQuery(async () => {
            for (const item of data) {
              const id = item.id || randomUUID();
              await sql`
                INSERT INTO budgets (id, category, "amountLimit", "userId", "createdAt", "updatedAt")
                VALUES (${id}, ${item.category}, ${item.amountLimit}, ${item.userId}, NOW(), NOW());
              `;
            }
            return { count: data.length };
          });
        },
      },
      $disconnect: async () => {},
    };
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma || createDatabaseClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
