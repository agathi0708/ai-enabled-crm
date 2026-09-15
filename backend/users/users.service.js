const repository = require("./users.repository");
const authService = require("../auth/auth.service");

function createValidationError(message) {
  const error = new Error(message);
  error.code = "VALIDATION_ERROR";
  return error;
}

function createNotFoundError(message) {
  const error = new Error(message);
  error.code = "NOT_FOUND";
  return error;
}

function createConflictError(message) {
  const error = new Error(message);
  error.code = "CONFLICT";
  return error;
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
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
    throw createValidationError(
      "Invalid email address"
    );
  }

  return normalized;
}

function validateRole(role) {
  const normalizedRole =
    role === "sales_rep"
      ? "rep"
      : role;

  if (
    !authService.ALLOWED_ROLES.includes(
      normalizedRole
    )
  ) {
    throw createValidationError(
      "Role must be admin, manager, rep, or viewer"
    );
  }

  return normalizedRole;
}

/**
 * List all users.
 */
async function listUsers() {
  const users =
    await repository.findAll();

  return users.map(
    authService.sanitizeUser
  );
}

/**
 * Invite a new user.
 */
async function inviteUser({
  name,
  email,
  role = "rep",
}) {
  const normalizedName =
    validateName(name);

  const normalizedEmail =
    validateEmail(email);

  const normalizedRole =
    validateRole(role);

  try {
    return await authService.inviteUser({
      name: normalizedName,
      email: normalizedEmail,
      role: normalizedRole,
    });
  } catch (error) {
    if (error.code === "CONFLICT") {
      throw createConflictError(
        "Email already registered"
      );
    }

    throw error;
  }
}

/**
 * Deactivate a user.
 */
async function deactivateUser(userId) {
  if (
    typeof userId !== "string" ||
    !userId.trim()
  ) {
    throw createValidationError(
      "User ID is required"
    );
  }

  const user =
    await repository.findById(
      userId.trim()
    );

  if (!user) {
    throw createNotFoundError(
      "User not found"
    );
  }

  const updatedUser =
    await repository.setActive(
      userId.trim(),
      false
    );

  return authService.sanitizeUser(
    updatedUser
  );
}

module.exports = {
  listUsers,
  inviteUser,
  deactivateUser,
};