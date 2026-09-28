const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const { getTheme, setTheme } = require('../controllers/themeController');

router.get('/theme', getTheme);
router.patch('/theme', protect, requireRole('admin'), setTheme);

module.exports = router;
