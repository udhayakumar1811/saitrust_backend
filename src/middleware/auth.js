const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

// Verifies the Bearer token and attaches the logged-in user to req.user.
// Every protected route (customer, staff, or admin) uses this first.
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw new ApiError(401, 'Not authenticated. Please log in.');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    throw new ApiError(401, 'The account for this session no longer exists.');
  }
  req.user = user;
  next();
});

// Like protect, but never throws — used on routes that behave the same for
// guests and logged-in users but want req.user when available (none of the
// current spec endpoints need this, kept for future public+personalized routes).
const attachUserIfPresent = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
  } catch {
    // ignore invalid token on optional-auth routes
  }
  next();
});

// Role gate — usage: router.get('/x', protect, requireRole('admin'), handler)
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action.'));
    }
    next();
  };
}

module.exports = { protect, attachUserIfPresent, requireRole };
