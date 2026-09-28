const asyncHandler = require('../utils/asyncHandler');
const About = require('../models/About');
const { deleteLocalFile, filenameFromUrl } = require('../utils/storage');

async function getOrCreateAbout() {
  let about = await About.findOne({ key: 'about' });
  if (!about) about = await About.create({ key: 'about' });
  return about;
}

const getAbout = asyncHandler(async (req, res) => {
  const about = await getOrCreateAbout();
  res.json({ success: true, data: about });
});

const updateAbout = asyncHandler(async (req, res) => {
  const about = await getOrCreateAbout();

  if (req.body.mediaUrl && req.body.mediaUrl !== about.mediaUrl) {
    const oldFilename = filenameFromUrl(about.mediaUrl);
    if (oldFilename) deleteLocalFile(oldFilename);
  }

  Object.assign(about, req.body);
  await about.save();
  res.json({ success: true, data: about });
});

module.exports = { getAbout, updateAbout };
