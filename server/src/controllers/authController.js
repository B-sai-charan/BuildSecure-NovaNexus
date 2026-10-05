import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';

const BCRYPT_SALT_ROUNDS = 12;

/**
 * Register a new user
 * Enforces bcrypt hashing with salt rounds >= 12 and checks unique email constraint.
 */
export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'A user with this email address already exists.',
        code: 'USER_ALREADY_EXISTS',
      });
    }

    // Hash password with bcrypt salt rounds >= 12
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Create user in PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate short-lived JWT token (15 minutes)
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login existing user
 * Verifies credentials, prevents user enumeration timing attacks, and issues short-lived JWT (15m).
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Fetch user with credentials
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Mitigate timing attack by performing a dummy hash comparison
      await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
        code: 'INVALID_CREDENTIALS',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Generate short-lived JWT (15 minutes)
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        hasAiKey: Boolean(user.aiKeyEncrypted),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 */
export const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found.',
        code: 'USER_NOT_FOUND',
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
