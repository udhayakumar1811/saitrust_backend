const mongoose = require('mongoose');

// Shared between Admin and Staff (Section 3.5 / 10) — image or video posts.
const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, default: '' },
    type: { type: String, enum: ['image', 'video'], required: true },
    description: { type: String, default: '' },
    mediaUrl: { type: String, default: null },
    author: { type: String, enum: ['staff', 'admin'], required: true },
    authorId: { type: String, required: true },
    authorName: { type: String, default: '' },
    date: { type: String, default: () => new Date().toISOString().slice(0, 10) },
  },
  { timestamps: true }
);

postSchema.plugin(require('../utils/toJSONPlugin'));

module.exports = mongoose.model('Post', postSchema);
