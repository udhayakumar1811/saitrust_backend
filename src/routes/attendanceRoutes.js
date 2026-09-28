const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/attendanceController');

router.post('/staff/presence', protect, requireRole('staff'), ctrl.markPresence);
router.get('/staff/presence/:staffId/today', protect, requireRole('staff', 'admin'), ctrl.getTodayPresence);
router.get('/attendance', protect, requireRole('admin'), ctrl.listForDate);
router.patch('/attendance/:staffId/:date', protect, requireRole('admin'), ctrl.setAttendance);

module.exports = router;
