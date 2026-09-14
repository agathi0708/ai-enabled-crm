const service = require("./activities.service");

function sendError(res, error) {
  const statusMap = {
    VALIDATION_ERROR: 400,
    NOT_FOUND: 404,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    CONFLICT: 409,
    RATE_LIMITED: 429,
  };

  const status =
    statusMap[error.code] || 500;

  return res.status(status).json({
    data: null,
    meta: {},
    error: {
      code:
        error.code || "INTERNAL_ERROR",
      message:
        error.message ||
        "An unexpected error occurred",
    },
  });
}

/**
 * POST /api/v1/activities
 */
async function createActivity(req, res) {
  try {
    const activity =
      await service.createActivity(
        req.body
      );

    return res.status(201).json({
      data: activity,
      meta: {},
      error: null,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

/**
 * GET /api/v1/contacts/:id/activities
 */
async function listContactActivities(
  req,
  res
) {
  try {
    const result =
      await service.listContactActivities({
        contactId: req.params.id,
        page: req.query.page,
        limit: req.query.limit,
      });

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 20,
        1
      ),
      100
    );

    return res.status(200).json({
      data: result.activities,
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(
          result.total / limit
        ),
      },
      error: null,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

/**
 * DELETE /api/v1/activities/:id
 */
async function deleteActivity(
  req,
  res
) {
  try {
    const activity =
      await service.deleteActivity(
        req.params.id
      );

    return res.status(200).json({
      data: activity,
      meta: {},
      error: null,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = {
  createActivity,
  listContactActivities,
  deleteActivity,
};
