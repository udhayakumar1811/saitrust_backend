const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const { generateStaffEmail, generateTempPassword, generateStaffId } = require('../utils/generateCredentials');

// GET /api/staff — Staff Management screen list. Includes each staff
// member's login password (Section 4) so Admin can always see it, not
// only right after registration.
const list = asyncHandler(async (req, res) => {
  const staff = await User.find({ role: 'staff' }).select('+staffTempPassword').sort({ createdAt: -1 });
  res.json({
    success: true,
    data: staff.map((s) => ({ ...s.toPublicJSON(), password: s.staffTempPassword || null })),
  });
});

// POST /api/staff — Admin-only registration (Section 4). Staff never
// self-register. Backend generates staffId, login email, and a temporary
// password, and returns all three once so Admin can copy/share them.
const create = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  if (!name) throw new ApiError(400, 'name is required.');

  const count = await User.countDocuments({ role: 'staff' });
  const staffId = generateStaffId(count + 1);

  let email = generateStaffEmail(name);
  let suffixNum = 1;
  // Guarantee a unique login email even if two staff share a name.
  while (await User.findOne({ email })) {
    email = generateStaffEmail(name, String(suffixNum));
    suffixNum += 1;
  }

  const password = generateTempPassword();

  const staff = await User.create({ name, phone, email, password, role: 'staff', staffId, staffTempPassword: password });

  res.status(201).json({
    success: true,
    data: { staffId: staff.staffId, email: staff.email, password },
  });
});

// PATCH /api/staff/:id — Admin edits name/phone.
const update = asyncHandler(async (req, res) => {
  const staff = await User.findOne({ _id: req.params.id, role: 'staff' });
  if (!staff) throw new ApiError(404, 'Staff member not found.');
  const { name, phone } = req.body;
  if (name !== undefined) staff.name = name;
  if (phone !== undefined) staff.phone = phone;
  await staff.save();
  res.json({ success: true, data: staff.toPublicJSON() });
});

// DELETE /api/staff/:id — Admin revokes a staff account.
const remove = asyncHandler(async (req, res) => {
  const staff = await User.findOne({ _id: req.params.id, role: 'staff' });
  if (!staff) throw new ApiError(404, 'Staff member not found.');
  await staff.deleteOne();
  res.json({ success: true, data: { id: req.params.id } });
});

// PATCH /api/staff/profile — staff edits their own name/phone/avatar
// (used by Profile.jsx via ProfileAPI.update('staff', payload)).
const updateOwnProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  if (name !== undefined) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  if (avatar !== undefined) req.user.avatar = avatar;
  await req.user.save();
  res.json({ success: true, data: req.user.toPublicJSON() });
});

module.exports = { list, create, update, remove, updateOwnProfile };
