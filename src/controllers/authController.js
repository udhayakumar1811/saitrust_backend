const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const Student = require('../models/Student');
const generateToken = require('../utils/generateToken');
const { generateStudentId } = require('../utils/generateCredentials');

// POST /api/auth/login — public site login for role 'customer' | 'staff'
// (admin uses the separate /api/admin/auth/login below).
const login = asyncHandler(async (req, res) => {
  const { role, email, password } = req.body;
  if (!role || !['customer', 'staff'].includes(role)) {
    throw new ApiError(400, "role must be 'customer' or 'staff'.");
  }
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required.');
  }

  const user = await User.findOne({ email: email.toLowerCase().trim(), role }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = generateToken(user);
  res.json({ success: true, data: { user: user.toPublicJSON(), token } });
});

// POST /api/auth/register — student/customer self-registration only.
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    throw new ApiError(400, 'name, email and password are required.');
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const count = await Student.countDocuments();
  const studentId = generateStudentId(count + 1);

  const user = await User.create({
    name,
    email: email.toLowerCase().trim(),
    phone,
    password,
    role: 'customer',
    studentId,
  });

  await Student.create({
    studentId,
    userId: user._id,
    name,
    course: '',
    certificateStatus: { completed: false, issuedAt: null, certificateNote: 'Course in progress' },
    upcomingClass: { batchTiming: '', reminder: '' },
  });

  const token = generateToken(user);
  res.status(201).json({ success: true, data: { user: user.toPublicJSON(), token } });
});

// POST /api/admin/auth/login — kept separate per spec Section 1.
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required.');
  }

  const user = await User.findOne({ email: email.toLowerCase().trim(), role: 'admin' }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid admin email or password.');
  }

  const token = generateToken(user);
  res.json({ success: true, data: { user: user.toPublicJSON(), token } });
});

// GET /api/auth/me — session restore on refresh, for any role.
const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user.toPublicJSON() } });
});

module.exports = { login, register, adminLogin, me };
