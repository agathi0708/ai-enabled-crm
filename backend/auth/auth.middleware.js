const {
  verifyAccessToken,
} = require("./auth.security");

/**
 * Require a valid JWT access token.
 *
 * On success:
 *   req.user = {
 *     id,
 *     email,
 *     role
 *   }
 */
function requireAuth(req, res, next) {
  const authorization =
    req.get("Authorization");

  if (
    !authorization ||
    !authorization.startsWith(
      "Bearer "
    )
  ) {
    return res.status(401).json({
      data: null,
      meta: {},
      error: {
        code: "UNAUTHORIZED",
        message:
          "Authorization token is required",
      },
    });
  }

  const token =
    authorization
      .slice(7)
      .trim();

  if (!token) {
    return res.status(401).json({
      data: null,
      meta: {},
      error: {
        code: "UNAUTHORIZED",
        message:
          "Authorization token is required",
      },
    });
  }

  try {
    const payload =
      verifyAccessToken(token);

    if (!payload.sub) {
      return res.status(401).json({
        data: null,
        meta: {},
        error: {
          code: "UNAUTHORIZED",
          message:
            "Invalid access token",
        },
      });
    }

    req.user = {
      id: String(payload.sub),
      email: payload.email,
      role: payload.role,
    };

    return next();
  } catch {
    return res.status(401).json({
      data: null,
      meta: {},
      error: {
        code: "UNAUTHORIZED",
        message:
          "Invalid or expired access token",
      },
    });
  }
}

/**
 * Require one of the specified roles.
 */
function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        data: null,
        meta: {},
        error: {
          code: "UNAUTHORIZED",
          message:
            "Authentication is required",
        },
      });
    }

    if (
      !allowedRoles.includes(
        req.user.role
      )
    ) {
      return res.status(403).json({
        data: null,
        meta: {},
        error: {
          code: "FORBIDDEN",
          message:
            "You do not have permission to access this resource",
        },
      });
    }

    return next();
  };
}

module.exports = {
  requireAuth,
  requireRoles,
};