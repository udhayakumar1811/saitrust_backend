const mongoose = require('mongoose');

// Section 7 — certificate status + upcoming class, controlled by Admin.
const studentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true },
    course: { type: String, default: '' },
    certificateStatus: {
      completed: { type: Boolean, default: false },
      issuedAt: { type: String, default: null },
      certificateNote: { type: String, default: '' },
      // The actual certificate image Admin uploads for this student (Section 7)
      // — shown, and downloadable, on the student's own dashboard once set.
      certificateImage: { type: String, default: null },
    },
    upcomingClass: {
      batchTiming: { type: String, default: '' },
      reminder: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

studentSchema.plugin(require('../utils/toJSONPlugin'));

module.exports = mongoose.model('Student', studentSchema);
