const crypto = require('crypto');

// Turns "Priya Kumar" into a slug usable as the local part of a login email,
// e.g. "priya.kumar". Falls back to "staff" if the name has no letters.
function slugifyName(name) {
  const slug = (name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join('.');
  return slug || 'staff';
}

// Generates a login email for a newly-registered staff member. Appends a
// short random suffix if needed by the caller to guarantee uniqueness.
function generateStaffEmail(name, suffix = '') {
  const base = slugifyName(name);
  return `${base}${suffix}@saitrustkovilpatti.org`;
}

// Generates a readable-but-random temporary password, e.g. "Sai@83417".
function generateTempPassword() {
  const digits = crypto.randomInt(10000, 99999);
  return `Sai@${digits}`;
}

// Generates a human-friendly staff ID, e.g. SAI-STAFF-0007.
function generateStaffId(sequence) {
  return `SAI-STAFF-${String(sequence).padStart(4, '0')}`;
}

// Generates a human-friendly student ID, e.g. SAI-STU-1042.
function generateStudentId(sequence) {
  return `SAI-STU-${String(1000 + sequence)}`;
}

module.exports = {
  slugifyName,
  generateStaffEmail,
  generateTempPassword,
  generateStaffId,
  generateStudentId,
};
