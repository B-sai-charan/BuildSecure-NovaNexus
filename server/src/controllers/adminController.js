import prisma from '../utils/prisma.js';

/**
 * Get Platform Telemetry & System Statistics (Admin Only)
 */
export const getPlatformStats = async (req, res, next) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalTransactions = await prisma.transaction.count();

    const transactions = await prisma.transaction.findMany({
      select: {
        type: true,
        amount: true,
      },
    });

    let totalVolume = 0;
    let totalInflow = 0;
    let totalOutflow = 0;

    transactions.forEach((tx) => {
      const amt = parseFloat(tx.amount) || 0;
      totalVolume += amt;
      if (tx.type === 'INCOME') {
        totalInflow += amt;
      } else {
        totalOutflow += amt;
      }
    });

    const totalBudgets = await prisma.budget.count();

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalTransactions,
        totalBudgets,
        totalVolume: parseFloat(totalVolume.toFixed(2)),
        totalInflow: parseFloat(totalInflow.toFixed(2)),
        totalOutflow: parseFloat(totalOutflow.toFixed(2)),
        systemStatus: 'OPERATIONAL',
        evaluatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Registered Users (Admin Only)
 * Excludes sensitive cryptographic secrets (passwordHash, aiKeyEncrypted, aiKeyIv, aiKeyTag)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            transactions: true,
            budgets: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};
