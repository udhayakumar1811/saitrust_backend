const mongoose = require('mongoose');

const heroImageSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    title: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

heroImageSchema.plugin(require('../utils/toJSONPlugin'));

module.exports = mongoose.model('HeroImage', heroImageSchema);
