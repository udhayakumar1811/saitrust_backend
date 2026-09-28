const mongoose = require('mongoose');

// Upcoming batch slots shown on the Admission form (BatchesAPI.getUpcoming).
// Not explicitly listed as its own section in the Backend Spec, but the
// existing frontend (src/services/api.js -> BatchesAPI, used in Admission.jsx)
// already expects this shape, so it's included as a straightforward,
// required-for-integration addition.
const batchSchema = new mongoose.Schema(
  {
    courseSlug: { type: String, required: true },
    course: { type: String, required: true }, // display name, e.g. "Aari Embroidery Work"
    courseTa: { type: String, default: '' },
    day: { type: String, required: true },
    month: { type: String, required: true },
    slot: { type: String, required: true },
    slotTa: { type: String, default: '' },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    seatsAvailable: { type: Number, required: true, default: 0, min: 0 },
    // Free-text status label shown on the card (e.g. "Seats Available",
    // "Filling Fast"). Kept separate from seatsAvailable so admin can set a
    // custom label; batchController derives a sensible default when absent.
    status: { type: String, default: '' },
    statusTa: { type: String, default: '' },
  },
  { timestamps: true }
);

batchSchema.plugin(require('../utils/toJSONPlugin'));

module.exports = mongoose.model('Batch', batchSchema);
