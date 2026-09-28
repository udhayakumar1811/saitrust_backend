const asyncHandler = require('../utils/asyncHandler');
const { buildFileUrl } = require('../utils/storage');

// POST /api/upload — Section 2. Accepts one image or video (multipart,
// field name "file"), stores it, and returns { url } for the caller to save
// on the relevant record (hero image, course image, post media, etc).
const uploadFile = asyncHandler(async (req, res) => {
  const url = buildFileUrl(req.file.filename);
  res.status(201).json({
    success: true,
    data: {
      url,
      filename: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
    },
  });
});

module.exports = { uploadFile };
