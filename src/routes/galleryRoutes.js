const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/galleryController');

router.get('/gallery', ctrl.list);
router.post('/gallery', protect, requireRole('admin'), ctrl.create);
router.patch('/gallery/:id', protect, requireRole('admin'), ctrl.update);
router.delete('/gallery/:id', protect, requireRole('admin'), ctrl.remove);

module.exports = router;
