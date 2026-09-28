// Consistent success envelope helper. Errors are handled separately by
// middleware/errorHandler.js so every failure also has one predictable shape.
function sendSuccess(res, statusCode, data, meta) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

module.exports = { sendSuccess };
