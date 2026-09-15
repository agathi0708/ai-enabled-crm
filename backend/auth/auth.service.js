const repository = require("./auth.repository");

const {
  hashPassword,
  verifyPassword,
  createAccessToken,
  createRefreshToken,
} = require("./auth.security");

const crypto = require("crypto");

const ALLOWED_ROLES = [
  "admin",
  "manager",
  "rep",
  "viewer",
];

function createValidationError(message) {
  const error = new Error(message);
  error.code = "VALIDATION_ERROR";
  return error;
}

function createUnauthorizedError(message) {
  const error = new Error(message);
  error.code = "UNAUTHORIZED";
  return error;
}

function createForbiddenError(message) {
  const error = new Error(message);
  error.code = "FORBIDDEN";
  return error;
}

function createNotFoundError(message) {
  const error = new Error(message);
  error.code = "NOT_FOUND";
  return error;
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function normalizeRole(role) {
  return role === "sales_rep"
    ? "rep"
    : role;
}

function validateName(name) {
  const normalized = String(name || "").trim();

  if (!normalized) {
    throw createValidationError("Name is required");
  }

  if (normalized.length > 120) {
    throw createValidationError(
      "Name must not exceed 120 characters"
    );
  }

  return normalized;
}

function validateEmail(email) {
  const normalized = normalizeEmail(email);

  if (!normalized) {
    throw createValidationError("Email is required");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw createValidationError("Invalid email address");
  }

  return normalized;
}

function validatePassword(password) {
  if (typeof password !== "string" || !password) {
    throw createValidationError("Password is required");
  }

  if (password.length < 8) {
    throw createValidationError(
      "Password must be at least 8 characters"
    );
  }

  return password;
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: normalizeRole(user.role),
    is_active: user.is_active,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

/**
 * Register a new user.
 */
async function register({
  name,
  email,
  password,
}) {
  const normalizedName = validateName(name);
  const normalizedEmail = validateEmail(email);
  const normalizedPassword = validatePassword(password);

  const existingUser =
    await repository.findByEmail(normalizedEmail);

  if (existingUser) {
    const error = new Error("Email already registered");
    error.code = "CONFLICT";
    throw error;
  }

  const passwordHash =
    await hashPassword(normalizedPassword);

  const user =
    await repository.createUser({
      name: normalizedName,
      email: normalizedEmail,
      passwordHash,
      role: "rep",
    });

  return sanitizeUser(user);
}

/**
 * Login an existing user.
 */
async function login({
  email,
  password,
}) {
  const normalizedEmail = validateEmail(email);
  const normalizedPassword = validatePassword(password);

  const user =
    await repository.findByEmail(normalizedEmail);

  if (!user) {
    throw createUnauthorizedError(
      "Invalid email or password"
    );
  }

  if (user.is_active === false) {
    throw createUnauthorizedError(
      "Invalid email or password"
    );
  }

  const passwordValid =
    await verifyPassword(
      normalizedPassword,
      user.password_hash
    );

  if (!passwordValid) {
    throw createUnauthorizedError(
      "Invalid email or password"
    );
  }

  const normalizedRole =
    normalizeRole(user.role);

  const userForToken = {
    ...user,
    role: normalizedRole,
  };

  const accessToken =
    createAccessToken(userForToken);

  const refreshToken =
    createRefreshToken(userForToken);

  const refreshPayload =
    require("jsonwebtoken").decode(refreshToken);

  const expiresAt =
    new Date(refreshPayload.exp * 1000);

  await repository.createRefreshToken({
    token: refreshToken,
    userId: user.id,
    expiresAt,
  });

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: "bearer",
    user: sanitizeUser(userForToken),
  };
}

/**
 * Get the currently authenticated user.
 */
async function getCurrentUser(userId) {
  const user =
    await repository.findById(userId);

  if (!user) {
    throw createNotFoundError("User not found");
  }

  if (user.is_active === false) {
    throw createUnauthorizedError(
      "User account is inactive"
    );
  }

  return sanitizeUser(user);
}

/**
 * Validate and retrieve a stored refresh token.
 */
async function getStoredRefreshToken(token) {
  const storedToken =
    await repository.findRefreshToken(token);

  if (!storedToken) {
    throw createUnauthorizedError(
      "Invalid or expired refresh token"
    );
  }

  if (storedToken.is_revoked) {
    throw createUnauthorizedError(
      "Invalid or expired refresh token"
    );
  }

  if (
    new Date(storedToken.expires_at).getTime() <=
    Date.now()
  ) {
    throw createUnauthorizedError(
      "Invalid or expired refresh token"
    );
  }

  return storedToken;
}

/**
 * Revoke a refresh token.
 */
async function logout(refreshToken) {
  if (
    typeof refreshToken !== "string" ||
    !refreshToken.trim()
  ) {
    throw createValidationError(
      "Refresh token is required"
    );
  }

  await repository.revokeRefreshToken(
    refreshToken.trim()
  );

  return {
    message: "Logged out successfully",
  };
}

/**
 * Create a new access token using a stored
 * and valid refresh token.
 */
async function refresh(refreshToken, verifyRefreshToken) {
  if (
    typeof refreshToken !== "string" ||
    !refreshToken.trim()
  ) {
    throw createValidationError(
      "Refresh token is required"
    );
  }

  const token =
    refreshToken.trim();

  await getStoredRefreshToken(token);

  let payload;

  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw createUnauthorizedError(
      "Invalid or expired refresh token"
    );
  }

  if (!payload.sub) {
    throw createUnauthorizedError(
      "Invalid refresh token"
    );
  }

  const user =
    await repository.findById(
      String(payload.sub)
    );

  if (!user || user.is_active === false) {
    throw createUnauthorizedError(
      "Invalid or expired refresh token"
    );
  }

  const normalizedUser = {
    ...user,
    role: normalizeRole(user.role),
  };

  const accessToken =
    createAccessToken(normalizedUser);

  return {
    access_token: accessToken,
    token_type: "bearer",
  };
}

/**
 * Generate a password reset token.
 */
async function requestPasswordReset(email) {
  const normalizedEmail =
    validateEmail(email);

  const user =
    await repository.findByEmail(
      normalizedEmail
    );

  const response = {
    message:
      "If the email exists, a password reset link has been generated.",
  };

  if (!user || user.is_active === false) {
    return response;
  }

  const token =
    crypto.randomBytes(48).toString("base64url");

  const expiresAt =
    new Date(Date.now() + 30 * 60 * 1000);

  await repository.createPasswordResetToken({
    token,
    userId: user.id,
    expiresAt,
  });

  /*
   * Development/testing only.
   * Production should send this token through
   * the configured password-reset email flow.
   */
  console.log("\n" + "=".repeat(60));
  console.log("PASSWORD RESET TOKEN");
  console.log("=".repeat(60));
  console.log(`Email: ${user.email}`);
  console.log(`Token: ${token}`);
  console.log("=".repeat(60) + "\n");

  return {
    ...response,
    resetToken: token,
  };
}

/**
 * Confirm a password reset.
 */
async function confirmPasswordReset({
  token,
  newPassword,
}) {
  if (
    typeof token !== "string" ||
    !token.trim()
  ) {
    throw createValidationError(
      "Reset token is required"
    );
  }

  const normalizedPassword =
    validatePassword(newPassword);

  const resetToken =
    await repository.findPasswordResetToken(
      token.trim()
    );

  if (!resetToken) {
    throw createUnauthorizedError(
      "Invalid or expired reset token"
    );
  }

  if (resetToken.is_used) {
    throw createUnauthorizedError(
      "Invalid or expired reset token"
    );
  }

  if (
    new Date(resetToken.expires_at).getTime() <=
    Date.now()
  ) {
    throw createUnauthorizedError(
      "Invalid or expired reset token"
    );
  }

  const user =
    await repository.findById(
      resetToken.user_id
    );

  if (!user || user.is_active === false) {
    throw createUnauthorizedError(
      "Invalid or expired reset token"
    );
  }

  const passwordHash =
    await hashPassword(normalizedPassword);

  const updatedUser =
    await repository.updatePassword(
      user.id,
      passwordHash
    );

  if (!updatedUser) {
    throw createNotFoundError("User not found");
  }

  await repository.markPasswordResetTokenUsed(
    token.trim()
  );

  return {
    message: "Password reset successfully",
  };
}

/**
 * Invite a new user.
 *
 * This follows the development-only behavior
 * from the updated Module 1 implementation.
 */
async function inviteUser({
  name,
  email,
  role,
}) {
  const normalizedName =
    validateName(name);

  const normalizedEmail =
    validateEmail(email);

  const normalizedRole =
    normalizeRole(role);

  if (!ALLOWED_ROLES.includes(normalizedRole)) {
    throw createValidationError(
      "Invalid user role"
    );
  }

  const existingUser =
    await repository.findByEmail(
      normalizedEmail
    );

  if (existingUser) {
    const error = new Error(
      "Email already registered"
    );

    error.code = "CONFLICT";

    throw error;
  }

  /*
   * Development-only temporary password.
   * Production should use an invitation/reset link.
   */
  const temporaryPassword = "Temp@123";

  const passwordHash =
    await hashPassword(
      temporaryPassword
    );

  const user =
    await repository.createUser({
      name: normalizedName,
      email: normalizedEmail,
      passwordHash,
      role: normalizedRole,
    });

  return {
    ...sanitizeUser(user),
    temporaryPassword,
  };
}

/**
 * Activate or deactivate a user.
 */
async function setUserActive(
  userId,
  isActive
) {
  if (typeof isActive !== "boolean") {
    throw createValidationError(
      "isActive must be a boolean"
    );
  }

  const user =
    await repository.setUserActive(
      userId,
      isActive
    );

  if (!user) {
    throw createNotFoundError(
      "User not found"
    );
  }

  return sanitizeUser(user);
}

/**
 * Check whether a user has one of
 * the specified roles.
 */
function hasRole(
  user,
  ...allowedRoles
) {
  if (!user) {
    return false;
  }

  const role =
    normalizeRole(user.role);

  return allowedRoles.includes(role);
}

module.exports = {
  ALLOWED_ROLES,
  register,
  login,
  getCurrentUser,
  getStoredRefreshToken,
  logout,
  refresh,
  requestPasswordReset,
  confirmPasswordReset,
  inviteUser,
  setUserActive,
  hasRole,
  sanitizeUser,
};
