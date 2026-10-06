import express from 'express';
import { getPlatformStats, getAllUsers } from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/auth.js';
import { isAdmin } from '../middleware/admin.js';

const router = express.Router();

// Enforce authentication AND admin role on all admin routes
router.use(authenticateToken, isAdmin);

/**
 * @route   GET /api/admin/stats
 * @desc    Retrieve aggregated platform metrics and system telemetry
 * @access  Private (ADMIN)
 */
router.get('/stats', getPlatformStats);

/**
 * @route   GET /api/admin/users
 * @desc    Retrieve all registered users with transaction counts
 * @access  Private (ADMIN)
 */
router.get('/users', getAllUsers);

export default router;
