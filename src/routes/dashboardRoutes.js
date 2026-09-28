const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const { getSummary } = require('../controllers/dashboardController');

router.get('/admin/dashboard', protect, requireRole('admin'), getSummary);

module.exports = router;
