const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    category: { type: String, default: '' },
    caption: { type: String, default: '' },
  },
  { timestamps: true }
);

galleryImageSchema.plugin(require('../utils/toJSONPlugin'));

module.exports = mongoose.model('GalleryImage', galleryImageSchema);
