const service = require("./auth.service");
const {
  verifyRefreshToken,
} = require("./auth.security");

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
 * POST /api/v1/auth/register
 */
async function register(req, res) {
  try {
    const user =
      await service.register(req.body || {});

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
 * POST /api/v1/auth/login
 */
async function login(req, res) {
  try {
    const result =
      await service.login(req.body || {});

    return res.status(200).json({
      data: result,
      meta: {},
      error: null,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

/**
 * POST /api/v1/auth/refresh
 *
 * Accepts both the TSD camelCase field and the
 * existing snake_case field for backward compatibility.
 */
async function refresh(req, res) {
  try {
    const refreshToken =
      req.body?.refreshToken ||
      req.body?.refresh_token;

    const result =
      await service.refresh(
        refreshToken,
        verifyRefreshToken
      );

    return res.status(200).json({
      data: result,
      meta: {},
      error: null,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

/**
 * POST /api/v1/auth/logout
 */
async function logout(req, res) {
  try {
    const refreshToken =
      req.body?.refreshToken ||
      req.body?.refresh_token;

    const result =
      await service.logout(refreshToken);

    return res.status(200).json({
      data: result,
      meta: {},
      error: null,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

/**
 * GET /api/v1/auth/me
 */
async function me(req, res) {
  try {
    if (!req.user || !req.user.id) {
      const error =
        new Error(
          "Authenticated user is required"
        );

      error.code = "UNAUTHORIZED";

      return sendError(res, error);
    }

    const user =
      await service.getCurrentUser(
        req.user.id
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

/**
 * POST /api/v1/auth/password-reset/request
 */
async function requestPasswordReset(req, res) {
  try {
    const result =
      await service.requestPasswordReset(
        req.body?.email
      );

    return res.status(200).json({
      data: result,
      meta: {},
      error: null,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

/**
 * POST /api/v1/auth/password-reset/confirm
 */
async function confirmPasswordReset(req, res) {
  try {
    const result =
      await service.confirmPasswordReset({
        token: req.body?.token,
        newPassword:
          req.body?.newPassword ||
          req.body?.new_password,
      });

    return res.status(200).json({
      data: result,
      meta: {},
      error: null,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
  requestPasswordReset,
  confirmPasswordReset,
  sendError,
};
