const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/postController');

router.get('/posts', ctrl.list);
router.post('/posts', protect, requireRole('admin', 'staff'), ctrl.create);
router.patch('/posts/:id', protect, requireRole('admin', 'staff'), ctrl.update);
router.delete('/posts/:id', protect, requireRole('admin', 'staff'), ctrl.remove);

module.exports = router;
