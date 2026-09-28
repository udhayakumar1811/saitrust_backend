const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/contactController');

router.post('/contact-submissions', ctrl.create);
router.get('/contact-submissions', protect, requireRole('admin'), ctrl.list);
router.delete('/contact-submissions/:id', protect, requireRole('admin'), ctrl.remove);
// Same create action, kept at this path too because that's what the public
// Contact.jsx form actually calls (EnquiriesAPI.submit -> POST /enquiries).
// Consolidated here instead of a stray one-liner in applicationRoutes.js so
// every contact-form-related route lives in one file.
router.post('/enquiries', ctrl.create);

module.exports = router;
