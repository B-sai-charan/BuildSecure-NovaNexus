/**
 * Admin Role Verification Middleware (RBAC)
 * Strictly verifies that the authenticated user possesses the 'ADMIN' role.
 * Must be mounted downstream from authenticateToken middleware.
 */
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. No session context found.',
      code: 'AUTH_REQUIRED',
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Administrative privileges required.',
      code: 'FORBIDDEN_ADMIN_REQUIRED',
    });
  }

  next();
};

export default isAdmin;
