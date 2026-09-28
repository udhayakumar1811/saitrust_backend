const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/studentController');
const { updateOwnStudentProfile, getOwnStudentProfile } = require('../controllers/profileController');

router.get('/students', protect, requireRole('admin'), ctrl.list);
router.post('/students', protect, requireRole('admin'), ctrl.create);
router.patch('/students/:id', protect, requireRole('admin'), ctrl.update);
router.delete('/students/:id', protect, requireRole('admin'), ctrl.remove);

// The student's own profile is served by profileController (richer shape:
// user info + nested student record, never 404s if no record exists yet).
// A duplicate `GET /students/me` -> studentController.me used to exist
// here too, returning a different, narrower shape — removed since the
// frontend only ever calls /student/profile below and the duplicate was
// unused dead code.

// Section 7 also backs the Student Dashboard's own profile edit
// (ProfileAPI.update('customer', payload) -> PATCH /student/profile).
router.get('/student/profile', protect, requireRole('customer'), getOwnStudentProfile);
router.patch('/student/profile', protect, requireRole('customer'), updateOwnStudentProfile);

module.exports = router;
