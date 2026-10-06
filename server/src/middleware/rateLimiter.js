import rateLimit from 'express-rate-limit';

/**
 * Strict Rate Limiter for Authentication & Sensitive Endpoints
 * Enforces a maximum of 5 requests per 15 minutes per IP to defend against brute-force / credential stuffing.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // Limit each IP per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  skipSuccessfulRequests: false,
});

/**
 * Standard API Rate Limiter
 * Protects general API endpoints against DoS and abusive volumetric queries (100 requests per 15 mins).
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests created from this IP, please try again after 15 minutes.',
    code: 'API_RATE_LIMIT_EXCEEDED'
  }
});

export default authRateLimiter;
