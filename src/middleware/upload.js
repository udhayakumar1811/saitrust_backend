const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const ApiError = require('../utils/ApiError');
const { UPLOADS_DIR } = require('../utils/storage');

const MAX_IMAGE_BYTES = (Number(process.env.MAX_IMAGE_SIZE_MB) || 5) * 1024 * 1024;
const MAX_VIDEO_BYTES = (Number(process.env.MAX_VIDEO_SIZE_MB) || 50) * 1024 * 1024;
// Multer needs one ceiling up front; per-type limits are enforced in the
// fileFilter/controller below using the values above.
const MAX_UPLOAD_BYTES = Math.max(MAX_IMAGE_BYTES, MAX_VIDEO_BYTES);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    cb(null, unique);
  },
});

function fileFilter(req, file, cb) {
  const isImage = file.mimetype.startsWith('image/');
  const isVideo = file.mimetype.startsWith('video/');
  if (!isImage && !isVideo) {
    return cb(new ApiError(400, 'Only image or video files are allowed.'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_UPLOAD_BYTES },
});

// Extra guard after multer accepts the file: images capped tighter than
// videos, since multer's `limits.fileSize` can only apply one number.
function enforcePerTypeLimit(req, res, next) {
  if (!req.file) return next(new ApiError(400, 'No file was uploaded. Attach it as "file".'));
  const isImage = req.file.mimetype.startsWith('image/');
  const limit = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (req.file.size > limit) {
    const { deleteLocalFile } = require('../utils/storage');
    deleteLocalFile(req.file.filename);
    return next(new ApiError(400, `File too large. Max size is ${isImage ? process.env.MAX_IMAGE_SIZE_MB || 5 : process.env.MAX_VIDEO_SIZE_MB || 50}MB for this type.`));
  }
  next();
}

module.exports = { upload, enforcePerTypeLimit };
