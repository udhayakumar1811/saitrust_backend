const ApiError = require('../utils/ApiError');

// Central error handler — every controller either throws/passes an ApiError
// (or lets asyncHandler forward a rejected promise) and it lands here, so
// the frontend always receives the same { success: false, message } shape
// and a sensible HTTP status code instead of a raw stack trace.
function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong on the server.';
  let details = err.details;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed.';
    details = Object.values(err.errors).map((e) => e.message);
  }
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}.`;
  }
  // Mongo duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} is already in use.` : 'Duplicate value.';
  }
  // Multer file-too-large / unexpected field
  if (err.name === 'MulterError') {
    statusCode = 400;
    message = err.message;
  }
  // Bad/expired JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again.';
  }

  if (statusCode >= 500) {
    console.error('[error]', err);
  }

  const body = { success: false, message };
  if (details) body.details = details;
  if (process.env.NODE_ENV !== 'production' && statusCode >= 500) body.stack = err.stack;

  res.status(statusCode).json(body);
}

module.exports = { notFound, errorHandler, ApiError };
