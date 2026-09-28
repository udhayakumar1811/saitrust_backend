const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

const todayStr = () => new Date().toISOString().slice(0, 10);

// POST /api/staff/presence — staff self check-in for today.
const markPresence = asyncHandler(async (req, res) => {
  // Always the logged-in staff member's own id — never trust body.staffId,
  // or one staff member could check in on another's behalf.
  const staffId = req.user.staffId;
  if (!staffId) throw new ApiError(400, 'This account has no staffId on record.');
  const date = todayStr();

  const record = await Attendance.findOneAndUpdate(
    { staffId, date },
    { staffId, date, status: 'present', source: 'self' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json({ success: true, data: record });
});

// GET /api/staff/presence/:staffId/today
const getTodayPresence = asyncHandler(async (req, res) => {
  if (req.user.role === 'staff' && req.user.staffId !== req.params.staffId) {
    throw new ApiError(403, 'You can only view your own attendance status.');
  }
  const date = todayStr();
  const record = await Attendance.findOne({ staffId: req.params.staffId, date });
  res.json({ success: true, data: record || null });
});

// GET /api/attendance?date=YYYY-MM-DD — every staff member's status for a
// date. Any staff with no record for a past date is reported as
// { status: 'absent', source: 'auto' } without being stored, per spec.
const listForDate = asyncHandler(async (req, res) => {
  const date = req.query.date || todayStr();
  const allStaff = await User.find({ role: 'staff' });
  const records = await Attendance.find({ date });
  const byStaffId = new Map(records.map((r) => [r.staffId, r]));

  const result = allStaff.map((staff) => {
    const rec = byStaffId.get(staff.staffId);
    if (rec) {
      return { staffId: staff.staffId, staffName: staff.name, date, status: rec.status, source: rec.source, updatedAt: rec.updatedAt };
    }
    if (date < todayStr()) {
      return { staffId: staff.staffId, staffName: staff.name, date, status: 'absent', source: 'auto', updatedAt: null };
    }
    return { staffId: staff.staffId, staffName: staff.name, date, status: 'unmarked', source: null, updatedAt: null };
  });

  res.json({ success: true, data: result });
});

// PATCH /api/attendance/:staffId/:date — Admin overrides a status.
const setAttendance = asyncHandler(async (req, res) => {
  const { staffId, date } = req.params;
  const { status } = req.body;
  if (!['present', 'absent'].includes(status)) {
    throw new ApiError(400, "status must be 'present' or 'absent'.");
  }
  const record = await Attendance.findOneAndUpdate(
    { staffId, date },
    { staffId, date, status, source: 'admin' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json({ success: true, data: record });
});

module.exports = { markPresence, getTodayPresence, listForDate, setAttendance };
