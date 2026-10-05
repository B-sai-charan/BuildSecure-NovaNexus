import { Router } from 'express';
import {
  saveAiKey,
  generateInsight,
  getAiKeyStatus,
  deleteAiKey,
} from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Protect all AI routes with JWT authentication
router.use(authenticateToken);

/**
 * @route   POST /api/ai/key
 * @desc    Securely encrypt and store user's AI API key at rest (AES-256-GCM)
 * @access  Protected
 */
router.post('/key', saveAiKey);

/**
 * @route   GET /api/ai/key/status
 * @desc    Check whether the user has an active encrypted API key saved
 * @access  Protected
 */
router.get('/key/status', getAiKeyStatus);

/**
 * @route   DELETE /api/ai/key
 * @desc    Delete user's stored encrypted API key
 * @access  Protected
 */
router.delete('/key', deleteAiKey);

/**
 * @route   POST /api/ai/generate
 * @desc    Generate personalized financial insights using in-memory decrypted API key
 * @access  Protected
 */
router.post('/generate', generateInsight);

export default router;
