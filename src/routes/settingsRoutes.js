const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const { getSettings, updateSettings, getHeroImage } = require('../controllers/settingsController');

router.get('/settings', getSettings);
router.patch('/settings', protect, requireRole('admin'), updateSettings);
router.get('/settings/hero-image', getHeroImage);

module.exports = router;
