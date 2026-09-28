const express = require('express');
const router = express.Router();

router.use(require('./authRoutes'));
router.use(require('./uploadRoutes'));
router.use(require('./heroRoutes'));
router.use(require('./courseRoutes'));
router.use(require('./batchRoutes'));
router.use(require('./aboutRoutes'));
router.use(require('./galleryRoutes'));
router.use(require('./postRoutes'));
router.use(require('./certificationRoutes'));
router.use(require('./settingsRoutes'));
router.use(require('./contactRoutes'));
router.use(require('./applicationRoutes'));
router.use(require('./staffRoutes'));
router.use(require('./attendanceRoutes'));
router.use(require('./permissionRoutes'));
router.use(require('./studentRoutes'));
router.use(require('./themeRoutes'));
router.use(require('./dashboardRoutes'));

router.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok', time: new Date().toISOString() } }));

module.exports = router;
