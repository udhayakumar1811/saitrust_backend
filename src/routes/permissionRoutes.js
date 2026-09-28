const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/permissionController');

router.post('/permission-requests', protect, requireRole('staff'), ctrl.create);
router.get('/permission-requests', protect, requireRole('staff', 'admin'), ctrl.list);
router.patch('/permission-requests/:id/approve', protect, requireRole('admin'), ctrl.approve);
router.patch('/permission-requests/:id/decline', protect, requireRole('admin'), ctrl.decline);
// Staff mark their own approved request complete once it's over (Admin can
// too, as a fallback, from the Permission Requests screen).
router.patch('/permission-requests/:id/complete', protect, requireRole('staff', 'admin'), ctrl.complete);

module.exports = router;
