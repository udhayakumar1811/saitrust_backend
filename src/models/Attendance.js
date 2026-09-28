const mongoose = require('mongoose');

// One record per staff member per date (Section 5). Any past date with no
// record is treated as absent at read time — see controllers/attendanceController.js
// — rather than backfilled with rows, per the spec's auto-absent rule.
const attendanceSchema = new mongoose.Schema(
  {
    staffId: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    status: { type: String, enum: ['present', 'absent'], required: true },
    source: { type: String, enum: ['self', 'admin', 'auto'], required: true },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

attendanceSchema.index({ staffId: 1, date: 1 }, { unique: true });

attendanceSchema.plugin(require('../utils/toJSONPlugin'));

module.exports = mongoose.model('Attendance', attendanceSchema);
