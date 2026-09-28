const mongoose = require('mongoose');

// Singleton document (Section 3.3) — always upserted against a fixed key.
const aboutSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'about', unique: true },
    mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    mediaUrl: { type: String, default: null },
    heading: { type: String, default: '' },
    paragraphs: { type: [String], default: [] },
    checklist: { type: [String], default: [] },
    buttonText: { type: String, default: 'Learn More' },
    buttonLink: { type: String, default: '/about' },
  },
  { timestamps: true }
);

aboutSchema.plugin(require('../utils/toJSONPlugin'));

module.exports = mongoose.model('About', aboutSchema);
