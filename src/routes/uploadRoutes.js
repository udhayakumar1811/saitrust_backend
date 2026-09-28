const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload, enforcePerTypeLimit } = require('../middleware/upload');
const { uploadFile } = require('../controllers/uploadController');

// Any authenticated user (admin/staff managing site media, or a
// customer/staff member uploading their own profile photo) can upload a
// file — the specific resource endpoints below enforce their own role
// checks on who may attach the resulting URL to a record.
router.post('/upload', protect, upload.single('file'), enforcePerTypeLimit, uploadFile);

module.exports = router;
