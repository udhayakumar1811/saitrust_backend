const nodemailer = require('nodemailer');

let cachedTransporter = null;
let warnedNoConfig = false;

function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  if (!isEmailConfigured()) return null;
  if (cachedTransporter) return cachedTransporter;

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return cachedTransporter;
}

// Best-effort email send. Never throws — a contact-form submission must
// still succeed and be saved even if email delivery fails or isn't
// configured yet, so callers should not await-block the response on this.
async function sendEmail({ to, subject, text, html }) {
  const transporter = getTransporter();
  if (!transporter) {
    if (!warnedNoConfig) {
      console.warn('[email] SMTP not configured — skipping email send (set SMTP_* in .env to enable).');
      warnedNoConfig = true;
    }
    return { sent: false, reason: 'not_configured' };
  }
  try {
    await transporter.sendMail({ from: process.env.EMAIL_FROM || process.env.SMTP_USER, to, subject, text, html });
    return { sent: true };
  } catch (err) {
    console.error('[email] Failed to send email:', err.message);
    return { sent: false, reason: err.message };
  }
}

module.exports = { sendEmail, isEmailConfigured };
