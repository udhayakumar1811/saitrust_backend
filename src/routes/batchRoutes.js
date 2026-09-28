const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/batchController');

router.get('/batches', ctrl.list);
router.post('/batches', protect, requireRole('admin'), ctrl.create);
router.patch('/batches/:id', protect, requireRole('admin'), ctrl.update);
router.delete('/batches/:id', protect, requireRole('admin'), ctrl.remove);

module.exports = router;
