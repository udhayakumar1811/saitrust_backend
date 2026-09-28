const mongoose = require('mongoose');

// Admission form submissions (Admission.jsx -> ApplicationsAPI.submit). Not
// its own numbered section in the Backend Spec, but required so
// CustomerDashboard's "My Applications" list (StudentAPI.getApplications)
// has real data to read once a logged-in customer applies.
const applicationSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    course: { type: String, required: true },
    batch: { type: String, default: '' },
    // Human-readable batch slot and its calendar date, so the Student
    // Dashboard can display the batch and drop it automatically once the
    // date has passed.
    batchLabel: { type: String, default: '' },
    batchDate: { type: String, default: '' },
    courseName: { type: String, default: '' },
    // Set only for a batch-specific application (student applying to an
    // exact batch, verified against their own logged-in Student ID) — lets
    // the Staff Dashboard's "Batch Applied Students" list find these and
    // the Student Dashboard show them separately from plain course enrolls.
    studentId: { type: String, default: '' },
    kind: { type: String, enum: ['course', 'batch'], default: 'course' },
    location: { type: String, required: true },
    message: { type: String, default: '' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
  },
  { timestamps: true }
);

applicationSchema.plugin(require('../utils/toJSONPlugin'));

module.exports = mongoose.model('Application', applicationSchema);
