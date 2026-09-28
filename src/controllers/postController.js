const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Post = require('../models/Post');
const { deleteLocalFile, filenameFromUrl } = require('../utils/storage');

// GET /api/posts — public Posts & Updates page, and (filtered client-side
// by authorId) the Staff Dashboard's "my posts" list.
const list = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.authorId) filter.authorId = req.query.authorId;
  // Frontend calls GET /posts?type=image for "Posts & Updates" and
  // GET /posts?type=video for the video carousel — without this, both
  // returned every post mixed together (image posts inside the video
  // player, video posts inside the image feed).
  if (req.query.type) filter.type = req.query.type;
  const posts = await Post.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: posts });
});

// POST /api/posts — staff or admin creates an image or video post.
const create = asyncHandler(async (req, res) => {
  const { title, category, type, description, mediaUrl } = req.body;
  if (!title || !type) throw new ApiError(400, 'title and type are required.');
  if (!['image', 'video'].includes(type)) throw new ApiError(400, "type must be 'image' or 'video'.");

  // author/authorId/authorName come from the logged-in user, not the body,
  // so a staff member can never post as someone else.
  const post = await Post.create({
    title,
    category,
    type,
    description,
    mediaUrl,
    author: req.user.role === 'admin' ? 'admin' : 'staff',
    authorId: req.user.staffId || req.user._id.toString(),
    authorName: req.user.name,
  });
  res.status(201).json({ success: true, data: post });
});

function assertCanModify(post, user) {
  if (user.role === 'admin') return;
  const ownerId = post.authorId;
  const isOwner = ownerId === user.staffId || ownerId === user._id.toString();
  if (!isOwner) throw new ApiError(403, 'You can only modify your own posts.');
}

// PATCH /api/posts/:id — staff (own posts) or admin (any post).
const update = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Post not found.');
  assertCanModify(post, req.user);

  if (req.body.mediaUrl && req.body.mediaUrl !== post.mediaUrl) {
    const oldFilename = filenameFromUrl(post.mediaUrl);
    if (oldFilename) deleteLocalFile(oldFilename);
  }

  const { title, category, type, description, mediaUrl } = req.body;
  if (title !== undefined) post.title = title;
  if (category !== undefined) post.category = category;
  if (type !== undefined) post.type = type;
  if (description !== undefined) post.description = description;
  if (mediaUrl !== undefined) post.mediaUrl = mediaUrl;
  await post.save();
  res.json({ success: true, data: post });
});

// DELETE /api/posts/:id — staff (own posts) or admin (any post).
const remove = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Post not found.');
  assertCanModify(post, req.user);

  const filename = filenameFromUrl(post.mediaUrl);
  if (filename) deleteLocalFile(filename);
  await post.deleteOne();
  res.json({ success: true, data: { id: req.params.id } });
});

module.exports = { list, create, update, remove };
