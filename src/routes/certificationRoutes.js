const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/certificationController');

router.get('/certification', ctrl.list);
router.post('/certification', protect, requireRole('admin'), ctrl.create);
router.patch('/certification/:id', protect, requireRole('admin'), ctrl.update);
router.delete('/certification/:id', protect, requireRole('admin'), ctrl.remove);

module.exports = router;
