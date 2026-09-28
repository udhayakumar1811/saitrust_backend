const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    caption: { type: String, default: '' },
  },
  { timestamps: true }
);

certificationSchema.plugin(require('../utils/toJSONPlugin'));

module.exports = mongoose.model('Certification', certificationSchema);
