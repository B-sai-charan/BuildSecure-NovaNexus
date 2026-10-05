import jwt from 'jsonwebtoken';

/**
 * Authentication Middleware (OWASP ASVS & NIST SP 800-63B Compliant)
 * Verifies short-lived JWT token and binds verified user context to the request.
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. No token provided.',
      code: 'AUTH_TOKEN_MISSING'
    });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('FATAL SECURITY ERROR: JWT_SECRET environment variable is missing.');
    return res.status(500).json({
      success: false,
      error: 'Internal server configuration error.',
      code: 'AUTH_CONFIG_ERROR'
    });
  }

  jwt.verify(token, secret, { algorithms: ['HS256', 'HS384', 'HS512'] }, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Session expired. Please log in again.',
          code: 'AUTH_TOKEN_EXPIRED'
        });
      }

      return res.status(401).json({
        success: false,
        error: 'Invalid or malformed authentication token.',
        code: 'AUTH_TOKEN_INVALID'
      });
    }

    const userId = decoded.userId || decoded.id || decoded.sub;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Token payload missing user identifier.',
        code: 'AUTH_PAYLOAD_INVALID'
      });
    }

    // Attach validated payload to req.user for strict downstream owner-scoped queries
    req.user = {
      userId: userId,
      id: userId,
      email: decoded.email,
      role: decoded.role || 'USER'
    };

    next();
  });
};

/**
 * Role-Based Authorization Guard Middleware
 */
export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
        code: 'AUTH_REQUIRED'
      });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Insufficient privileges.',
        code: 'FORBIDDEN_INSUFFICIENT_ROLE'
      });
    }

    next();
  };
};

export default authenticateToken;
