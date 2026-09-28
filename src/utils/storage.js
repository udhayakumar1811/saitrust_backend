const fs = require('fs');
const path = require('path');

// Local disk storage today (UPLOAD_DRIVER=local). To move to S3/Cloudinary
// later, implement the same two functions against that provider and swap
// UPLOAD_DRIVER — nothing in the controllers needs to change since they only
// call buildFileUrl()/deleteLocalFile() through this module.
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

function buildFileUrl(filename) {
  const base = (process.env.PUBLIC_BASE_URL || '').replace(/\/+$/, '');
  return `${base}/uploads/${filename}`;
}

function deleteLocalFile(filename) {
  if (!filename) return;
  const filePath = path.join(UPLOADS_DIR, filename);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error('[storage] Failed to delete file:', filePath, err.message);
    }
  });
}

// Given a previously-returned URL (or bare filename), extracts the filename
// so it can be removed from disk when a record is replaced or deleted.
function filenameFromUrl(url) {
  if (!url) return null;
  try {
    const parts = url.split('/uploads/');
    return parts.length > 1 ? parts[1] : null;
  } catch {
    return null;
  }
}

module.exports = { UPLOADS_DIR, buildFileUrl, deleteLocalFile, filenameFromUrl };
