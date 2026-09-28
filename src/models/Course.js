const mongoose = require('mongoose');

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    nameTa: { type: String, default: '' },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, default: '' },
    tagline: { type: String, default: '' }, // small badge on the course card, e.g. "Bridal Specialist"
    taglineTa: { type: String, default: '' },
    duration: { type: String, default: '' },
    durationTa: { type: String, default: '' },
    description: { type: String, default: '' },
    descriptionTa: { type: String, default: '' },
    // Bullet points shown on the course card AND the "Course Modules" list
    // on the course-details page — one field, two places it renders.
    highlights: { type: [String], default: [] },
    highlightsTa: { type: [String], default: [] },
    benefits: { type: [String], default: [] }, // "Benefits & Career Paths" on course-details page
    benefitsTa: { type: [String], default: [] },
    practicalProject: { type: String, default: '' },
    practicalProjectTa: { type: String, default: '' },
    image: { type: String, default: null },
  },
  { timestamps: true }
);

courseSchema.pre('validate', function setSlug(next) {
  if (!this.slug && this.name) this.slug = slugify(this.name);
  next();
});

courseSchema.plugin(require('../utils/toJSONPlugin'));

module.exports = mongoose.model('Course', courseSchema);
