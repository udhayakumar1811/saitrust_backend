// Wraps an async route handler so any thrown/rejected error is forwarded to
// Express's error middleware, instead of needing try/catch in every controller.
module.exports = function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
