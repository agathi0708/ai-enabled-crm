const repository = require("./auth.repository");

const {
  hashPassword,
  verifyPassword,
  createAccessToken,
  createRefreshToken,
} = require("./auth.security");

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
  const normalized =
    String(name || "").trim();

  if (!normalized) {
    throw createValidationError(
      "Name is required"
    );
  }

  if (normalized.length > 120) {
    throw createValidationError(
      "Name must not exceed 120 characters"
    );
  }

  return normalized;
}

function validateEmail(email) {
  const normalized =
    normalizeEmail(email);

  if (!normalized) {
    throw createValidationError(
      "Email is required"
    );
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      normalized
    )
  ) {
    throw createValidationError(
      "Invalid email address"
    );
  }

  return normalized;
}

function validatePassword(password) {
  if (
    typeof password !== "string" ||
    !password
  ) {
    throw createValidationError(
      "Password is required"
    );
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
  const normalizedName =
    validateName(name);

  const normalizedEmail =
    validateEmail(email);

  const normalizedPassword =
    validatePassword(password);

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

  const passwordHash =
    await hashPassword(
      normalizedPassword
    );

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
 *
 * Returns both access and refresh tokens.
 */
async function login({
  email,
  password,
}) {
  const normalizedEmail =
    validateEmail(email);

  const normalizedPassword =
    validatePassword(password);

  const user =
    await repository.findByEmail(
      normalizedEmail
    );

  if (!user) {
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
    createAccessToken(
      userForToken
    );

  const refreshToken =
    createRefreshToken(
      userForToken
    );

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: "bearer",
    user: sanitizeUser(
      userForToken
    ),
  };
}

/**
 * Get the currently authenticated user.
 */
async function getCurrentUser(
  userId
) {
  const user =
    await repository.findById(
      userId
    );

  if (!user) {
    const error = new Error(
      "User not found"
    );

    error.code = "NOT_FOUND";

    throw error;
  }

  return sanitizeUser(user);
}

/**
 * Check whether a user has
 * one of the specified roles.
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

  return allowedRoles.includes(
    role
  );
}

module.exports = {
  ALLOWED_ROLES,
  register,
  login,
  getCurrentUser,
  hasRole,
  sanitizeUser,
};