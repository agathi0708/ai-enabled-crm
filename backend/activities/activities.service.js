const repository = require("./activities.repository");

const ALLOWED_TYPES = [
  "call",
  "email",
  "meeting",
  "note",
];

function createValidationError(message) {
  const error = new Error(message);
  error.code = "VALIDATION_ERROR";
  return error;
}

/**
 * Validate activity creation input.
 */
function validateActivityInput(data = {}) {
  if (
    !data.contact_id ||
    typeof data.contact_id !== "string"
  ) {
    throw createValidationError(
      "contact_id is required"
    );
  }

  if (!ALLOWED_TYPES.includes(data.type)) {
    throw createValidationError(
      "Invalid activity type"
    );
  }

  if (
    typeof data.notes !== "string" ||
    !data.notes.trim()
  ) {
    throw createValidationError(
      "Notes are required"
    );
  }

  return {
    contactId: data.contact_id,
    type: data.type,
    notes: data.notes.trim(),
  };
}

/**
 * Create a new activity.
 */
async function createActivity(data) {
  const validated =
    validateActivityInput(data);

  const exists =
    await repository.contactExists(
      validated.contactId
    );

  if (!exists) {
    const error = new Error(
      "Contact not found"
    );

    error.code = "NOT_FOUND";

    throw error;
  }

  return repository.create(validated);
}

/**
 * Get activities for a contact.
 */
async function listContactActivities({
  contactId,
  page = 1,
  limit = 20,
}) {
  const exists =
    await repository.contactExists(
      contactId
    );

  if (!exists) {
    const error = new Error(
      "Contact not found"
    );

    error.code = "NOT_FOUND";

    throw error;
  }

  const safePage = Math.max(
    Number(page) || 1,
    1
  );

  const safeLimit = Math.min(
    Math.max(
      Number(limit) || 20,
      1
    ),
    100
  );

  return repository.findByContactId({
    contactId,
    page: safePage,
    limit: safeLimit,
  });
}

/**
 * Get activity summary for a contact.
 */
async function getContactActivitySummary(
  contactId
) {
  const exists =
    await repository.contactExists(
      contactId
    );

  if (!exists) {
    const error = new Error(
      "Contact not found"
    );

    error.code = "NOT_FOUND";

    throw error;
  }

  return repository.getSummary(
    contactId
  );
}

/**
 * Delete an activity by ID.
 */
async function deleteActivity(id) {
  if (
    !id ||
    typeof id !== "string"
  ) {
    throw createValidationError(
      "Activity ID is required"
    );
  }

  const activity =
    await repository.remove(id);

  if (!activity) {
    const error = new Error(
      "Activity not found"
    );

    error.code = "NOT_FOUND";

    throw error;
  }

  return activity;
}

module.exports = {
  createActivity,
  listContactActivities,
  getContactActivitySummary,
  deleteActivity,
};