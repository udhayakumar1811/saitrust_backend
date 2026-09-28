const rateLimit = require('express-rate-limit');

// Tighter limit on auth endpoints to slow down credential-stuffing/brute
// force attempts, separate from the general API limiter in app.js.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again in a few minutes.' },
});

module.exports = { authLimiter };
