import { z } from 'zod';

/**
 * User Registration Schema (NIST SP 800-63B Compliant)
 * Enforces strong password requirements: min 12 characters, upper, lower, number, special char.
 */
export const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Invalid email address format')
    .max(255, 'Email cannot exceed 255 characters'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(12, 'Password must be at least 12 characters long')
    .max(128, 'Password cannot exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

/**
 * User Login Schema
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Invalid email address format'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

/**
 * Transaction Creation Schema
 */
export const createTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE'], {
    required_error: 'Transaction type must be either INCOME or EXPENSE',
  }),
  amount: z
    .number({ required_error: 'Amount is required' })
    .positive('Amount must be a positive number')
    .max(1000000000, 'Amount exceeds maximum allowable transaction limit'),
  category: z
    .string({ required_error: 'Category is required' })
    .trim()
    .min(1, 'Category cannot be empty')
    .max(50, 'Category cannot exceed 50 characters'),
  description: z
    .string()
    .trim()
    .max(255, 'Description cannot exceed 255 characters')
    .optional()
    .nullable(),
  date: z
    .string()
    .datetime({ message: 'Date must be a valid ISO 8601 string' })
    .optional()
    .or(z.date().optional()),
});

/**
 * Express Middleware factory to validate request body using Zod
 */
export const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
        code: 'VALIDATION_ERROR',
      });
    }
    next(error);
  }
};
