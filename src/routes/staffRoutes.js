const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/staffController');

router.get('/staff', protect, requireRole('admin'), ctrl.list);
router.post('/staff', protect, requireRole('admin'), ctrl.create);
router.patch('/staff/profile', protect, requireRole('staff'), ctrl.updateOwnProfile);
router.patch('/staff/:id', protect, requireRole('admin'), ctrl.update);
router.delete('/staff/:id', protect, requireRole('admin'), ctrl.remove);

module.exports = router;
