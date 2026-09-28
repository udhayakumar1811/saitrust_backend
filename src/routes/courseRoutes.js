const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/courseController');

router.get('/courses', ctrl.list);
router.get('/courses/:slug', ctrl.getBySlug);
router.post('/courses', protect, requireRole('admin'), ctrl.create);
router.patch('/courses/:id', protect, requireRole('admin'), ctrl.update);
router.delete('/courses/:id', protect, requireRole('admin'), ctrl.remove);

module.exports = router;
