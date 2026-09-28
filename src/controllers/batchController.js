const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Batch = require('../models/Batch');

// Fills in a sensible status label from seatsAvailable when the admin
// hasn't set a custom one, so BatchCard.jsx never renders a blank pill.
function withDerivedStatus(batchDoc) {
  const batch = batchDoc.toJSON ? batchDoc.toJSON() : batchDoc;
  if (!batch.status) {
    batch.status = batch.seatsAvailable > 0 ? 'Seats Available' : 'Filling Fast';
  }
  if (!batch.statusTa) {
    batch.statusTa = batch.seatsAvailable > 0 ? 'இடங்கள் உள்ளன' : 'விரைவில் நிரம்பும்';
  }
  return batch;
}

// GET /api/batches — public read for the Admission form + Batches page.
const list = asyncHandler(async (req, res) => {
  const batches = await Batch.find().sort({ createdAt: 1 });
  res.json({ success: true, data: batches.map(withDerivedStatus) });
});

// POST /api/batches — admin adds a batch slot.
const create = asyncHandler(async (req, res) => {
  const { courseSlug, course, courseTa, day, month, slot, slotTa, startTime, endTime, seatsAvailable, status, statusTa } = req.body;
  if (!courseSlug || !course || !day || !month || !slot || !startTime || !endTime) {
    throw new ApiError(400, 'courseSlug, course, day, month, slot, startTime and endTime are required.');
  }
  const batch = await Batch.create({
    courseSlug, course, courseTa, day, month, slot, slotTa, startTime, endTime,
    seatsAvailable: seatsAvailable ?? 0, status, statusTa,
  });
  res.status(201).json({ success: true, data: withDerivedStatus(batch) });
});

// PATCH /api/batches/:id — admin edits a batch slot (e.g. updates seat count).
const update = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.id);
  if (!batch) throw new ApiError(404, 'Batch not found.');
  Object.assign(batch, req.body);
  await batch.save();
  res.json({ success: true, data: withDerivedStatus(batch) });
});

// DELETE /api/batches/:id — admin removes a batch slot.
const remove = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.id);
  if (!batch) throw new ApiError(404, 'Batch not found.');
  await batch.deleteOne();
  res.json({ success: true, data: { id: req.params.id } });
});

module.exports = { list, create, update, remove };
