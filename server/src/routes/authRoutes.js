import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { validateBody, registerSchema, loginSchema } from '../utils/validators.js';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account with strong password requirements
 * @access  Public (Rate limited)
 */
router.post(
  '/register',
  authRateLimiter,
  validateBody(registerSchema),
  register
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user credentials and receive short-lived JWT (15m)
 * @access  Public (Strict Rate Limited: 5 reqs / 15m)
 */
router.post(
  '/login',
  authRateLimiter,
  validateBody(loginSchema),
  login
);

/**
 * @route   GET /api/auth/me
 * @desc    Retrieve currently authenticated user profile
 * @access  Protected (Requires Bearer JWT)
 */
router.get(
  '/me',
  authenticateToken,
  getMe
);

export default router;
