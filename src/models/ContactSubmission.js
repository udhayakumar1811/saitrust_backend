const mongoose = require('mongoose');

const contactSubmissionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: '' },
    message: { type: String, required: true },
    date: { type: String, default: () => new Date().toISOString().slice(0, 10) },
  },
  { timestamps: true }
);

contactSubmissionSchema.plugin(require('../utils/toJSONPlugin'));

module.exports = mongoose.model('ContactSubmission', contactSubmissionSchema);
