const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ContactSubmission = require('../models/ContactSubmission');
const { getOrCreateSettings } = require('./settingsController');
const { sendEmail } = require('../utils/sendEmail');

// POST /api/contact-submissions — public Contact form. Saves the message and
// (best-effort, non-blocking) emails the trust's contact address.
const create = asyncHandler(async (req, res) => {
  const { name, phone, email, message } = req.body;
  if (!name || !phone || !message) {
    throw new ApiError(400, 'name, phone and message are required.');
  }

  const submission = await ContactSubmission.create({ name, phone, email, message });

  // Fire-and-forget: a slow/broken SMTP server must never block or fail the
  // visitor's form submission, since the message is already saved above.
  getOrCreateSettings()
    .then((settings) => {
      if (!settings.email) return;
      return sendEmail({
        to: settings.email,
        subject: `New website enquiry from ${name}`,
        text: `Name: ${name}\nPhone: ${phone}\nEmail: ${email || '-'}\n\nMessage:\n${message}`,
      });
    })
    .catch((err) => console.error('[contact] email notification failed:', err.message));

  res.status(201).json({ success: true, data: submission });
});

// GET /api/contact-submissions — admin inbox.
const list = asyncHandler(async (req, res) => {
  const submissions = await ContactSubmission.find().sort({ createdAt: -1 });
  res.json({ success: true, data: submissions });
});

// DELETE /api/contact-submissions/:id — admin removes a handled submission.
const remove = asyncHandler(async (req, res) => {
  const submission = await ContactSubmission.findById(req.params.id);
  if (!submission) throw new ApiError(404, 'Submission not found.');
  await submission.deleteOne();
  res.json({ success: true, data: { id: req.params.id } });
});

module.exports = { create, list, remove };
