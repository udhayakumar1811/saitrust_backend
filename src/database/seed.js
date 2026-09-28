// One-time / idempotent bootstrap script: creates the first Admin account
// (from SEED_ADMIN_* in .env) plus baseline singleton documents (Settings,
// Theme, About) so the API isn't empty on first boot. Safe to re-run —
// every step checks for existing data first.
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Settings = require('../models/Settings');
const Theme = require('../models/Theme');
const About = require('../models/About');

async function run() {
  await connectDB();

  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@saitrust.demo').toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
  const existingAdmin = await User.findOne({ email: adminEmail }).select('+password');
  if (!existingAdmin) {
    await User.create({
      name: process.env.SEED_ADMIN_NAME || 'Trust Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });
    console.log(`[seed] Created admin account: ${adminEmail}`);
  } else {
    // The admin account already exists (idempotent seed), but it may have
    // been created earlier with a different SEED_ADMIN_PASSWORD than what
    // .env currently has — that mismatch is what makes the real admin
    // login return "Invalid admin email or password" even though the
    // .env/demo-hint password looks correct. Keep the stored password in
    // sync with .env so the two never silently drift apart.
    const passwordMatches = await existingAdmin.comparePassword(adminPassword);
    if (!passwordMatches) {
      existingAdmin.password = adminPassword;
      await existingAdmin.save();
      console.log(`[seed] Admin account already exists: ${adminEmail} — password updated to match .env`);
    } else {
      console.log(`[seed] Admin account already exists: ${adminEmail}`);
    }
  }

  const settings = await Settings.findOne({ key: 'settings' });
  if (!settings) {
    await Settings.create({
      key: 'settings',
      trustName: 'SAI International Social Service Trust',
      phones: ['+91 90251 16369', '+91 91509 81734'],
      whatsapp: '+91 90251 16369',
      email: 'info@saitrustkovilpatti.org',
      address: 'Kovilpatti, Thoothukudi District, Tamil Nadu',
      social: { instagram: '', facebook: '', youtube: '' },
    });
    console.log('[seed] Created default settings.');
  }

  const theme = await Theme.findOne({ key: 'theme' });
  if (!theme) {
    await Theme.create({ key: 'theme', activePresetId: 'gold-black' });
    console.log('[seed] Created default theme.');
  }

  const about = await About.findOne({ key: 'about' });
  if (!about) {
    await About.create({
      key: 'about',
      mediaType: 'image',
      mediaUrl: null,
      heading: 'Empowering Women Through Skill Training',
      paragraphs: [
        'SAI International Social Service Trust has been dedicated to providing practical, job-ready skill training to women across Kovilpatti and the surrounding region.',
        'Our ISO-certified courses combine hands-on practice with real business guidance, helping every student build a sustainable livelihood.',
      ],
      checklist: [
        'ISO certified practical training',
        'Experienced, hands-on trainers',
        'Flexible morning, afternoon & evening batches',
        'Placement & self-employment guidance',
      ],
      buttonText: 'Learn More',
      buttonLink: '/about',
    });
    console.log('[seed] Created default About Us content.');
  }

  console.log('[seed] Done.');
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
