const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const PermissionRequest = require('../models/PermissionRequest');

// POST /api/permission-requests — staff submits a leave/permission request.
const create = asyncHandler(async (req, res) => {
  const { date, time, description } = req.body;
  if (!date || !time) {
    throw new ApiError(400, 'date and time are required.');
  }
  // staffId/staffName always come from the logged-in staff member, never the
  // request body, so a staff member can't file a request as someone else.
  const request = await PermissionRequest.create({
    staffId: req.user.staffId,
    staffName: req.user.name,
    date,
    time,
    description,
  });
  res.status(201).json({ success: true, data: request });
});

// GET /api/permission-requests — admin (all, optionally ?status=) or
// GET /api/permission-requests?staffId= — that staff member's own requests.
const list = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  // A staff member can only ever see their own requests, regardless of what
  // (if anything) is passed in ?staffId= — only Admin can list everyone's.
  if (req.user.role === 'staff') {
    filter.staffId = req.user.staffId;
  } else if (req.query.staffId) {
    filter.staffId = req.query.staffId;
  }

  const requests = await PermissionRequest.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: requests });
});

// PATCH /api/permission-requests/:id/approve
const approve = asyncHandler(async (req, res) => {
  const request = await PermissionRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, 'Request not found.');
  request.status = 'approved';
  await request.save();
  res.json({ success: true, data: request });
});

// PATCH /api/permission-requests/:id/decline
const decline = asyncHandler(async (req, res) => {
  const request = await PermissionRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, 'Request not found.');
  request.status = 'declined';
  await request.save();
  res.json({ success: true, data: request });
});

// PATCH /api/permission-requests/:id/complete — staff marks their own
// approved request as complete once the step-out/leave is over.
const complete = asyncHandler(async (req, res) => {
  const request = await PermissionRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, 'Request not found.');
  request.status = 'completed';
  await request.save();
  res.json({ success: true, data: request });
});

module.exports = { create, list, approve, decline, complete };
