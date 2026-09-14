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
      await service.register(
        req.body
      );

    return res.status(201).json({
      data: user,
      meta: {},
      error: null,
    });
  } catch (error) {
    return sendError(
      res,
      error
    );
  }
}

/**
 * POST /api/v1/auth/login
 */
async function login(req, res) {
  try {
    const result =
      await service.login(
        req.body
      );

    return res.status(200).json({
      data: result,
      meta: {},
      error: null,
    });
  } catch (error) {
    return sendError(
      res,
      error
    );
  }
}

/**
 * POST /api/v1/auth/refresh
 *
 * Accepts a refresh token and returns
 * a new access token.
 */
async function refresh(req, res) {
  try {
    const refreshToken =
      req.body?.refresh_token;

    if (
      typeof refreshToken !==
        "string" ||
      !refreshToken.trim()
    ) {
      const error = new Error(
        "Refresh token is required"
      );

      error.code =
        "VALIDATION_ERROR";

      return sendError(
        res,
        error
      );
    }

    let payload;

    try {
      payload =
        verifyRefreshToken(
          refreshToken.trim()
        );
    } catch {
      const error = new Error(
        "Invalid or expired refresh token"
      );

      error.code =
        "UNAUTHORIZED";

      return sendError(
        res,
        error
      );
    }

    if (!payload.sub) {
      const error = new Error(
        "Invalid refresh token"
      );

      error.code =
        "UNAUTHORIZED";

      return sendError(
        res,
        error
      );
    }

    const user =
      await service.getCurrentUser(
        String(payload.sub)
      );

    const normalizedUser = {
      ...user,
      role:
        user.role === "sales_rep"
          ? "rep"
          : user.role,
    };

    const accessToken =
      require("./auth.security").createAccessToken(
        normalizedUser
      );

    return res.status(200).json({
      data: {
        access_token: accessToken,
        token_type: "bearer",
      },
      meta: {},
      error: null,
    });
  } catch (error) {
    return sendError(
      res,
      error
    );
  }
}

/**
 * GET /api/v1/auth/me
 *
 * Requires authentication middleware.
 */
async function me(req, res) {
  try {
    if (
      !req.user ||
      !req.user.id
    ) {
      const error =
        new Error(
          "Authenticated user is required"
        );

      error.code =
        "UNAUTHORIZED";

      return sendError(
        res,
        error
      );
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
    return sendError(
      res,
      error
    );
  }
}

module.exports = {
  register,
  login,
  refresh,
  me,
  sendError,
};