const mongoose = require('mongoose');

// Singleton document (Section 8) — persists which of the 10 frontend-defined
// presets is currently active, so it applies for every visitor.
const themeSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'theme', unique: true },
    activePresetId: { type: String, default: 'gold-black' },
  },
  { timestamps: true }
);

themeSchema.plugin(require('../utils/toJSONPlugin'));

module.exports = mongoose.model('Theme', themeSchema);
