const asyncHandler = require('../utils/asyncHandler');
const Settings = require('../models/Settings');
const { deleteLocalFile, filenameFromUrl } = require('../utils/storage');

async function getOrCreateSettings() {
  let settings = await Settings.findOne({ key: 'settings' });
  if (!settings) settings = await Settings.create({ key: 'settings' });
  return settings;
}

// GET /api/settings — public: footer + contact page + map.
const getSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json({ success: true, data: settings });
});

// PATCH /api/settings — admin-only.
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  const { phones, whatsapp, email, address, social, staffDashboardUrl, logoUrl } = req.body;
  if (phones !== undefined) settings.phones = phones;
  if (whatsapp !== undefined) settings.whatsapp = whatsapp;
  if (email !== undefined) settings.email = email;
  if (address !== undefined) settings.address = address;
  if (staffDashboardUrl !== undefined) settings.staffDashboardUrl = staffDashboardUrl;
  if (social !== undefined) settings.social = { ...settings.social.toObject(), ...social };
  if (logoUrl !== undefined && logoUrl !== settings.logoUrl) {
    // Replacing (or clearing) the logo — clean up the old uploaded file,
    // same pattern as the CRUD-factory media fields.
    const oldFilename = filenameFromUrl(settings.logoUrl);
    if (oldFilename) deleteLocalFile(oldFilename);
    settings.logoUrl = logoUrl;
  }
  await settings.save();
  res.json({ success: true, data: settings });
});

// GET /api/settings/hero-image — kept for parity with the frontend's
// existing HeroAPI.getActive() call shape ({ imageUrl }); returns the
// most recent active hero image's URL, or null.
const getHeroImage = asyncHandler(async (req, res) => {
  const HeroImage = require('../models/HeroImage');
  const latest = await HeroImage.findOne().sort({ order: 1, createdAt: -1 });
  res.json({ success: true, data: { imageUrl: latest ? latest.imageUrl : null } });
});

module.exports = { getSettings, updateSettings, getHeroImage, getOrCreateSettings };
