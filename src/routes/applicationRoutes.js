const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/applicationController');

router.post('/applications', protect, requireRole('customer'), ctrl.create);
// Admin sees everything; staff also needs this for the "Batch Applied
// Students" list on the Staff Dashboard (Student ID/phone/course/batch for
// students who booked a specific batch).
router.get('/applications', protect, requireRole('admin', 'staff'), ctrl.list);
router.patch('/applications/:id', protect, requireRole('admin'), ctrl.updateStatus);
router.get('/student/applications', protect, requireRole('customer'), ctrl.myApplications);
router.delete('/applications/:id', protect, requireRole('customer', 'admin'), ctrl.remove);
// Contact-form submission moved to routes/contactRoutes.js (POST /enquiries
// lives there now, alongside /contact-submissions which share the same
// controller/collection) — kept out of this file since it isn't actually
// an "application" route.

module.exports = router;
