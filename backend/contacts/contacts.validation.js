const CREATE_STATUSES = ["new", "hot", "warm", "cold"];
const ALL_STATUSES = ["new", "hot", "warm", "cold", "converted"];

function createValidationError(message) {
  const error = new Error(message);
  error.code = "VALIDATION_ERROR";
  return error;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateTags(tags) {
  if (tags === undefined) {
    return;
  }

  if (!Array.isArray(tags)) {
    throw createValidationError("Tags must be an array");
  }

  for (const tag of tags) {
    if (typeof tag !== "string" || tag.trim().length === 0) {
      throw createValidationError(
        "Each tag must be a non-empty string"
      );
    }
  }
}

function validateCreateContact(data) {
  if (!data || typeof data !== "object") {
    throw createValidationError("Request body must be an object");
  }

  if (
    typeof data.name !== "string" ||
    data.name.trim().length < 1 ||
    data.name.trim().length > 120
  ) {
    throw createValidationError(
      "Name is required and must be between 1 and 120 characters"
    );
  }

  if (
    data.company !== undefined &&
    data.company !== null &&
    typeof data.company !== "string"
  ) {
    throw createValidationError("Company must be a string");
  }

  if (
    data.email !== undefined &&
    data.email !== null &&
    data.email !== ""
  ) {
    if (typeof data.email !== "string" || !validateEmail(data.email)) {
      throw createValidationError("Invalid email address");
    }
  }

  if (
    data.phone !== undefined &&
    data.phone !== null &&
    typeof data.phone !== "string"
  ) {
    throw createValidationError("Phone must be a string");
  }

  if (
    data.status !== undefined &&
    !CREATE_STATUSES.includes(data.status)
  ) {
    throw createValidationError(
      "Status must be one of: new, hot, warm, cold"
    );
  }

  validateTags(data.tags);

  if (
    data.source !== undefined &&
    data.source !== null &&
    typeof data.source !== "string"
  ) {
    throw createValidationError("Source must be a string");
  }

  if (
    data.notes !== undefined &&
    data.notes !== null &&
    typeof data.notes !== "string"
  ) {
    throw createValidationError("Notes must be a string");
  }

  return true;
}

function validateUpdateContact(data) {
  if (!data || typeof data !== "object") {
    throw createValidationError("Request body must be an object");
  }

  if (data.name !== undefined) {
    if (
      typeof data.name !== "string" ||
      data.name.trim().length < 1 ||
      data.name.trim().length > 120
    ) {
      throw createValidationError(
        "Name must be between 1 and 120 characters"
      );
    }
  }

  if (
    data.email !== undefined &&
    data.email !== null &&
    data.email !== ""
  ) {
    if (typeof data.email !== "string" || !validateEmail(data.email)) {
      throw createValidationError("Invalid email address");
    }
  }

  if (
    data.status !== undefined &&
    !ALL_STATUSES.includes(data.status)
  ) {
    throw createValidationError(
      "Status must be one of: new, hot, warm, cold, converted"
    );
  }

  validateTags(data.tags);

  return true;
}

function validateContactId(id) {
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(id)) {
    throw createValidationError("Invalid contact ID");
  }

  return true;
}

module.exports = {
  validateCreateContact,
  validateUpdateContact,
  validateContactId,
};