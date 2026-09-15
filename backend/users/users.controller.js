const service = require("./users.service");

/**
 * Send a consistent API error response.
 */
function sendError(res, error) {
  const statusMap = {
    VALIDATION_ERROR: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
  };

  const status =
    statusMap[error.code] || 500;

  return res.status(status).json({
    data: null,
    meta: {},
    error: {
      code:
        error.code ||
        "INTERNAL_ERROR",
      message:
        error.message ||
        "An unexpected error occurred",
    },
  });
}

/**
 * GET /api/v1/users
 */
async function listUsers(req, res) {
  try {
    const users =
      await service.listUsers();

    return res.status(200).json({
      data: users,
      meta: {
        total: users.length,
      },
      error: null,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

/**
 * POST /api/v1/users/invite
 */
async function inviteUser(req, res) {
  try {
    const user =
      await service.inviteUser(
        req.body || {}
      );

    return res.status(201).json({
      data: user,
      meta: {},
      error: null,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

/**
 * PATCH /api/v1/users/:id/deactivate
 */
async function deactivateUser(req, res) {
  try {
    const user =
      await service.deactivateUser(
        req.params.id
      );

    return res.status(200).json({
      data: user,
      meta: {},
      error: null,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = {
  listUsers,
  inviteUser,
  deactivateUser,
  sendError,
};