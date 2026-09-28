const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Course = require('../models/Course');
const { deleteLocalFile, filenameFromUrl } = require('../utils/storage');

const list = asyncHandler(async (req, res) => {
  const courses = await Course.find().sort({ createdAt: -1 });
  res.json({ success: true, data: courses });
});

const getBySlug = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug });
  if (!course) throw new ApiError(404, 'Course not found.');
  res.json({ success: true, data: course });
});

const create = asyncHandler(async (req, res) => {
  const {
    name, nameTa, category, tagline, taglineTa, duration, durationTa,
    description, descriptionTa, highlights, highlightsTa,
    benefits, benefitsTa, practicalProject, practicalProjectTa,
    image, slug,
  } = req.body;
  if (!name) throw new ApiError(400, 'name is required.');
  const course = await Course.create({
    name, nameTa, category, tagline, taglineTa, duration, durationTa,
    description, descriptionTa, highlights, highlightsTa,
    benefits, benefitsTa, practicalProject, practicalProjectTa,
    image, slug,
  });
  res.status(201).json({ success: true, data: course });
});

const update = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, 'Course not found.');

  if (req.body.image && req.body.image !== course.image) {
    const oldFilename = filenameFromUrl(course.image);
    if (oldFilename) deleteLocalFile(oldFilename);
  }

  Object.assign(course, req.body);
  await course.save();
  res.json({ success: true, data: course });
});

const remove = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, 'Course not found.');
  const filename = filenameFromUrl(course.image);
  if (filename) deleteLocalFile(filename);
  await course.deleteOne();
  res.json({ success: true, data: { id: req.params.id } });
});

module.exports = { list, getBySlug, create, update, remove };
