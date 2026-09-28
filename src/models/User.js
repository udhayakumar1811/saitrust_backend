const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// One users collection for all three roles (see Backend Spec, Section 1 and
// the "Summary for the backend build" note — one table with a role column).
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: [6, 'Password must be at least 6 characters.'], select: false },
    role: { type: String, enum: ['admin', 'staff', 'customer'], required: true },
    avatar: { type: String, default: null },

    // customer/student-only fields
    studentId: { type: String, unique: true, sparse: true },

    // staff-only fields
    staffId: { type: String, unique: true, sparse: true },
    // Kept only so Admin can see a staff member's login password in the
    // Staff Management table (Section 4) — never returned to the staff
    // member themselves (excluded from toPublicJSON, only ever selected
    // explicitly by staffController's admin-facing list()).
    staffTempPassword: { type: String, select: false, default: null },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    avatar: this.avatar,
    studentId: this.studentId,
    staffId: this.staffId,
  };
};

userSchema.plugin(require('../utils/toJSONPlugin'));

module.exports = mongoose.model('User', userSchema);
