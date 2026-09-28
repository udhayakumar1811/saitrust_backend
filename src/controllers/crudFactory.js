const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { deleteLocalFile, filenameFromUrl } = require('../utils/storage');

// Small shared factory for the simple "list / add / edit / delete" resources
// (hero images, gallery, certification) so each one isn't hand-rolled
// boilerplate. Resources with real business logic (courses, posts, students,
// attendance, etc.) get their own dedicated controller files instead.
function makeCrudController(Model, { mediaField } = {}) {
  const list = asyncHandler(async (req, res) => {
    const items = await Model.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: items });
  });

  const create = asyncHandler(async (req, res) => {
    const item = await Model.create(req.body);
    res.status(201).json({ success: true, data: item });
  });

  const update = asyncHandler(async (req, res) => {
    const existing = await Model.findById(req.params.id);
    if (!existing) throw new ApiError(404, 'Item not found.');

    // If the media field is being replaced, clean up the old local file.
    if (mediaField && req.body[mediaField] && req.body[mediaField] !== existing[mediaField]) {
      const oldFilename = filenameFromUrl(existing[mediaField]);
      if (oldFilename) deleteLocalFile(oldFilename);
    }

    Object.assign(existing, req.body);
    await existing.save();
    res.json({ success: true, data: existing });
  });

  const remove = asyncHandler(async (req, res) => {
    const existing = await Model.findById(req.params.id);
    if (!existing) throw new ApiError(404, 'Item not found.');

    if (mediaField) {
      const filename = filenameFromUrl(existing[mediaField]);
      if (filename) deleteLocalFile(filename);
    }

    await existing.deleteOne();
    res.json({ success: true, data: { id: req.params.id } });
  });

  return { list, create, update, remove };
}

module.exports = makeCrudController;
