/**
 * middlewares/rateLimiter.js
 * Rate limiting using express-rate-limit.
 *
 * Install: npm install express-rate-limit
 */

const rateLimit = require("express-rate-limit");

/**
 * Strict limiter cho contact form — 5 requests / 15 phút / IP.
 * Giúp chặn spam.
 */
const contactFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: "Bạn đã gửi quá nhiều lần. Vui lòng thử lại sau 15 phút.",
  },
  standardHeaders: true,  // Trả về RateLimit headers
  legacyHeaders: false,
  skipFailedRequests: false,
});

/**
 * General limiter cho toàn bộ API — 100 requests / 15 phút / IP.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Quá nhiều requests. Vui lòng thử lại sau.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { contactFormLimiter, apiLimiter };
