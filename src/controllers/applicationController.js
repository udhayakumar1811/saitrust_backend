const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Application = require('../models/Application');

// POST /api/applications — public Admission form (customer must be logged
// in per the frontend's ProtectedRoute, so req.user is available to link it).
const create = asyncHandler(async (req, res) => {
  const { fullName, phone, course, batch, batchLabel, batchDate, courseName, studentId, kind, location, message } = req.body;
  if (!fullName || !phone || !course || !location) {
    throw new ApiError(400, 'fullName, phone, course and location are required.');
  }

  // A batch application must be for this exact logged-in student — the
  // frontend already checks this, but it's re-checked here so a mismatched
  // Student ID/phone can never be saved even if that check is bypassed.
  if (kind === 'batch') {
    const matchesId = studentId && req.user.studentId && studentId.trim().toUpperCase() === req.user.studentId.toUpperCase();
    const matchesPhone = phone && req.user.phone && phone.trim() === req.user.phone;
    if (!matchesId || !matchesPhone) {
      throw new ApiError(400, 'Student ID and phone number must match your logged-in account.');
    }
  }

  const application = await Application.create({
    fullName,
    phone,
    course,
    batch,
    batchLabel,
    batchDate,
    courseName,
    studentId: kind === 'batch' ? studentId : '',
    kind: kind === 'batch' ? 'batch' : 'course',
    location,
    message,
    userId: req.user ? req.user._id : null,
  });
  res.status(201).json({ success: true, data: application });
});

// GET /api/student/applications — the logged-in customer's own applications.
const myApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: applications });
});

// GET /api/applications — admin: full list.
const list = asyncHandler(async (req, res) => {
  const applications = await Application.find().sort({ createdAt: -1 });
  res.json({ success: true, data: applications });
});

// PATCH /api/applications/:id — admin updates status (pending/approved/rejected/completed).
const updateStatus = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) throw new ApiError(404, 'Application not found.');
  const { status } = req.body;
  if (status) application.status = status;
  await application.save();
  res.json({ success: true, data: application });
});

// DELETE /api/applications/:id — the student cancels their own application
// (admins may cancel any). Used by the Student Dashboard's "Cancel Course".
const remove = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) throw new ApiError(404, 'Application not found.');

  const isOwner = application.userId && application.userId.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner) {
    throw new ApiError(403, 'You can only cancel your own application.');
  }

  await application.deleteOne();
  res.json({ success: true, data: { id: req.params.id } });
});

module.exports = { create, myApplications, list, updateStatus, remove };
