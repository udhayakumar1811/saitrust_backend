const mongoose = require('mongoose');

// Singleton document (Section 3.7) for footer / contact / social info.
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'settings', unique: true },
    trustName: { type: String, default: 'SAI International Social Service Trust' },
    phones: { type: [String], default: [] },
    whatsapp: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    // Admin-uploaded logo (replaces the bundled default in the navbar and
    // splash screen everywhere on the public site) — null means "use the
    // default logo".
    logoUrl: { type: String, default: null },
    // Where a staff member is sent after logging in (StaffRedirect.jsx reads
    // this from GET /settings). Without it, staff login had nowhere to go.
    staffDashboardUrl: { type: String, default: '' },
    social: {
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

settingsSchema.plugin(require('../utils/toJSONPlugin'));

module.exports = mongoose.model('Settings', settingsSchema);
