const mongoose = require('mongoose');

const permissionRequestSchema = new mongoose.Schema(
  {
    staffId: { type: String, required: true },
    staffName: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'declined', 'completed'], default: 'pending' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

permissionRequestSchema.plugin(require('../utils/toJSONPlugin'));

module.exports = mongoose.model('PermissionRequest', permissionRequestSchema);
