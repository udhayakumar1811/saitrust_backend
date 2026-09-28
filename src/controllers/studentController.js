const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Student = require('../models/Student');

// GET /api/students — Admin Panel's Students screen.
const list = asyncHandler(async (req, res) => {
  const students = await Student.find().sort({ createdAt: -1 });
  res.json({ success: true, data: students });
});

// POST /api/students — Admin adds a student record.
const create = asyncHandler(async (req, res) => {
  const { studentId, name, course } = req.body;
  if (!studentId || !name) throw new ApiError(400, 'studentId and name are required.');
  const student = await Student.create({ studentId, name, course });
  res.status(201).json({ success: true, data: student });
});

// PATCH /api/students/:id — Admin sets certificate status / upcoming class.
const update = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw new ApiError(404, 'Student not found.');
  const { certificateStatus, upcomingClass, name, course } = req.body;
  if (name !== undefined) student.name = name;
  if (course !== undefined) student.course = course;
  if (certificateStatus) student.certificateStatus = { ...student.certificateStatus.toObject(), ...certificateStatus };
  if (upcomingClass) student.upcomingClass = { ...student.upcomingClass.toObject(), ...upcomingClass };
  await student.save();
  res.json({ success: true, data: student });
});

// DELETE /api/students/:id — Admin removes a student record.
const remove = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw new ApiError(404, 'Student not found.');
  await student.deleteOne();
  res.json({ success: true, data: { id: req.params.id } });
});

module.exports = { list, create, update, remove };
