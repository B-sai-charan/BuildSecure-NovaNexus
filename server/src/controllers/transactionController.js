import prisma from '../utils/prisma.js';

/**
 * Create a new Transaction (Strict Owner-Scoped)
 * Attaches the transaction directly to authenticated req.user.id
 */
export const createTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { amount, type, category, description, date } = req.body;

    const transaction = await prisma.transaction.create({
      data: {
        amount,
        type,
        category,
        description: description || null,
        date: date ? new Date(date) : new Date(),
        userId, // Strictly bound to authenticated session user
      },
      select: {
        id: true,
        amount: true,
        type: true,
        category: true,
        description: true,
        date: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Transaction created successfully.',
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all Transactions for the Authenticated User (Strict Owner-Scoped)
 * Enforces `where: { userId }` with optional filtering by type/category/date
 */
export const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, category, startDate, endDate, limit = 50, offset = 0 } = req.query;

    const whereClause = {
      userId, // Strictly owner-scoped
    };

    if (type && (type === 'INCOME' || type === 'EXPENSE')) {
      whereClause.type = type;
    }

    if (category) {
      whereClause.category = String(category);
    }

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        whereClause.date.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.date.lte = new Date(endDate);
      }
    }

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        orderBy: { date: 'desc' },
        take: Math.min(Number(limit) || 50, 100),
        skip: Number(offset) || 0,
        select: {
          id: true,
          amount: true,
          type: true,
          category: true,
          description: true,
          date: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.transaction.count({
        where: whereClause,
      }),
    ]);

    return res.status(200).json({
      success: true,
      transactions,
      pagination: {
        total: totalCount,
        limit: Math.min(Number(limit) || 50, 100),
        offset: Number(offset) || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Single Transaction by ID (Strict Owner-Scoped)
 * Enforces `where: { id, userId }` to prevent IDOR / Broken Object Level Authorization
 */
export const getTransactionById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId, // Strict owner scope
      },
      select: {
        id: true,
        amount: true,
        type: true,
        category: true,
        description: true,
        date: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found or access denied.',
        code: 'TRANSACTION_NOT_FOUND',
      });
    }

    return res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Transaction (Strict Owner-Scoped)
 * Enforces `where: { id, userId }` — never deletes transactions owned by another user.
 */
export const deleteTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verify ownership before deletion (Strict IDOR prevention)
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId, // Strict owner scope
      },
    });

    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found or access denied.',
        code: 'TRANSACTION_NOT_FOUND',
      });
    }

    await prisma.transaction.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully.',
      deletedId: id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Financial Summary (Strict Owner-Scoped)
 * Computes income, expenses, and net balance for authenticated user.
 */
export const getFinancialSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [incomeAggregate, expenseAggregate] = await Promise.all([
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { userId, type: 'INCOME' },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { userId, type: 'EXPENSE' },
      }),
    ]);

    const totalIncome = incomeAggregate._sum.amount || 0;
    const totalExpenses = expenseAggregate._sum.amount || 0;
    const netBalance = totalIncome - totalExpenses;

    return res.status(200).json({
      success: true,
      summary: {
        totalIncome,
        totalExpenses,
        netBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};
