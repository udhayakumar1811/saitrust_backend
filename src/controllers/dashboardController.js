const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Post = require('../models/Post');
const PermissionRequest = require('../models/PermissionRequest');
const ContactSubmission = require('../models/ContactSubmission');
const Attendance = require('../models/Attendance');

const todayStr = () => new Date().toISOString().slice(0, 10);

// GET /api/admin/dashboard?date=YYYY-MM-DD — Section 9. Combined summary +
// attendance list for the Admin Dashboard home screen, computed from the
// same collections/logic as the individual endpoints.
const getSummary = asyncHandler(async (req, res) => {
  const date = req.query.date || todayStr();

  const [allStaff, totalStudents, totalCourses, totalPosts, pendingPermissionCount, contactMessageCount, attendanceRecords] =
    await Promise.all([
      User.find({ role: 'staff' }),
      Student.countDocuments(),
      Course.countDocuments(),
      Post.countDocuments(),
      PermissionRequest.countDocuments({ status: 'pending' }),
      ContactSubmission.countDocuments(),
      Attendance.find({ date }),
    ]);

  const byStaffId = new Map(attendanceRecords.map((r) => [r.staffId, r]));
  const attendanceList = allStaff.map((staff) => {
    const rec = byStaffId.get(staff.staffId);
    if (rec) return { staffId: staff.staffId, staffName: staff.name, date, status: rec.status, source: rec.source };
    if (date < todayStr()) return { staffId: staff.staffId, staffName: staff.name, date, status: 'absent', source: 'auto' };
    return { staffId: staff.staffId, staffName: staff.name, date, status: 'unmarked', source: null };
  });

  const staffPresentCount = attendanceList.filter((r) => r.status === 'present').length;

  res.json({
    success: true,
    data: {
      staffPresentCount,
      totalStaff: allStaff.length,
      totalStudents,
      totalCourses,
      totalPosts,
      pendingPermissionCount,
      contactMessageCount,
      date,
      attendance: attendanceList,
    },
  });
});

module.exports = { getSummary };
