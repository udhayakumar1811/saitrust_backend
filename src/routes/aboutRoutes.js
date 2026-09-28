const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const { getAbout, updateAbout } = require('../controllers/aboutController');

router.get('/about', getAbout);
router.patch('/about', protect, requireRole('admin'), updateAbout);

module.exports = router;
