const asyncHandler = require('../utils/asyncHandler');
const Student = require('../models/Student');

// PATCH /api/student/profile — customer edits their own name/phone/avatar
// (ProfileAPI.update('customer', payload) in the frontend).
const updateOwnStudentProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  if (name !== undefined) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  if (avatar !== undefined) req.user.avatar = avatar;
  await req.user.save();

  // Keep the linked Student record's display name in sync, if one exists.
  if (name !== undefined) {
    await Student.updateOne({ userId: req.user._id }, { $set: { name } });
  }

  res.json({ success: true, data: req.user.toPublicJSON() });
});

// GET /api/student/profile — StudentAPI.getProfile(); the logged-in
// customer's account info plus their linked Student (course/certificate) record.
const getOwnStudentProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  res.json({ success: true, data: { ...req.user.toPublicJSON(), student: student || null } });
});

module.exports = { updateOwnStudentProfile, getOwnStudentProfile };
