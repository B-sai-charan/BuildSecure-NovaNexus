import { Router } from 'express';
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  deleteTransaction,
  getFinancialSummary,
} from '../controllers/transactionController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody, createTransactionSchema } from '../utils/validators.js';

const router = Router();

// All transaction routes require valid JWT authentication
router.use(authenticateToken);

/**
 * @route   POST /api/transactions
 * @desc    Create a new transaction strictly attached to the authenticated user
 * @access  Protected
 */
router.post(
  '/',
  validateBody(createTransactionSchema),
  createTransaction
);

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions owned by authenticated user (with filtering & pagination)
 * @access  Protected
 */
router.get(
  '/',
  getTransactions
);

/**
 * @route   GET /api/transactions/summary
 * @desc    Get aggregated financial summary (income, expenses, balance) for authenticated user
 * @access  Protected
 */
router.get(
  '/summary',
  getFinancialSummary
);

/**
 * @route   GET /api/transactions/:id
 * @desc    Get single transaction by ID with strict ownership validation
 * @access  Protected
 */
router.get(
  '/:id',
  getTransactionById
);

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Delete transaction by ID with strict ownership validation
 * @access  Protected
 */
router.delete(
  '/:id',
  deleteTransaction
);

export default router;
