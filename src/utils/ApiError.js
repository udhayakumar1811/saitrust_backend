// Custom error class carrying an HTTP status code, used throughout the
// controllers so the error middleware can respond with the right code and a
// consistent JSON shape instead of always defaulting to 500.
class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

module.exports = ApiError;
