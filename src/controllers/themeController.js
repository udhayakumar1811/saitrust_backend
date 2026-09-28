const asyncHandler = require('../utils/asyncHandler');
const Theme = require('../models/Theme');

async function getOrCreateTheme() {
  let theme = await Theme.findOne({ key: 'theme' });
  if (!theme) theme = await Theme.create({ key: 'theme' });
  return theme;
}

// GET /api/theme — public: applied on load by both public site and admin.
const getTheme = asyncHandler(async (req, res) => {
  const theme = await getOrCreateTheme();
  res.json({ success: true, data: { activePresetId: theme.activePresetId } });
});

// PATCH /api/theme — Admin switches the active preset.
const setTheme = asyncHandler(async (req, res) => {
  const theme = await getOrCreateTheme();
  if (req.body.activePresetId) theme.activePresetId = req.body.activePresetId;
  await theme.save();
  res.json({ success: true, data: { activePresetId: theme.activePresetId } });
});

module.exports = { getTheme, setTheme };
