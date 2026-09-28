const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/heroController');

router.get('/hero-images', ctrl.list);
router.post('/hero-images', protect, requireRole('admin'), ctrl.create);
router.patch('/hero-images/:id', protect, requireRole('admin'), ctrl.update);
router.delete('/hero-images/:id', protect, requireRole('admin'), ctrl.remove);

module.exports = router;
