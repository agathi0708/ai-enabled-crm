const repository = require("./contacts.repository");
const activitiesRepository = require("../activities/activities.repository");

const ALLOWED_STATUSES = [
  "new",
  "hot",
  "warm",
  "cold",
  "converted",
];

function createValidationError(message) {
  const error = new Error(message);
  error.code = "VALIDATION_ERROR";
  return error;
}

function normalizeTags(tags) {
  if (tags === undefined) {
    return undefined;
  }

  if (!Array.isArray(tags)) {
    throw createValidationError(
      "Tags must be an array"
    );
  }

  return tags
    .map((tag) => String(tag).trim())
    .filter(Boolean);
}

function validateCreateInput(data) {
  if (!data || typeof data !== "object") {
    throw createValidationError(
      "Request body must be an object"
    );
  }

  if (
    !data.name ||
    typeof data.name !== "string"
  ) {
    throw createValidationError(
      "Name is required"
    );
  }

  const name = data.name.trim();

  if (name.length < 1 || name.length > 120) {
    throw createValidationError(
      "Name must be between 1 and 120 characters"
    );
  }

  if (
    data.status &&
    !ALLOWED_STATUSES.includes(data.status)
  ) {
    throw createValidationError(
      "Invalid contact status"
    );
  }

  if (
    data.email !== undefined &&
    data.email !== null &&
    data.email !== "" &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      data.email
    )
  ) {
    throw createValidationError(
      "Invalid email address"
    );
  }

  const tags = normalizeTags(data.tags);

  return {
    name,
    company: data.company?.trim() || null,
    email: data.email?.trim() || null,
    phone: data.phone?.trim() || null,
    status: data.status || "new",
    tags: tags || [],
    source: data.source?.trim() || null,
    notes: data.notes?.trim() || null,
  };
}

function validateUpdateInput(data) {
  if (!data || typeof data !== "object") {
    throw createValidationError(
      "Request body must be an object"
    );
  }

  const cleaned = {};

  if (data.name !== undefined) {
    if (typeof data.name !== "string") {
      throw createValidationError(
        "Name must be a string"
      );
    }

    const name = data.name.trim();

    if (name.length < 1 || name.length > 120) {
      throw createValidationError(
        "Name must be between 1 and 120 characters"
      );
    }

    cleaned.name = name;
  }

  if (data.company !== undefined) {
    cleaned.company =
      data.company?.trim() || null;
  }

  if (data.email !== undefined) {
    if (
      data.email !== null &&
      data.email !== "" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        data.email
      )
    ) {
      throw createValidationError(
        "Invalid email address"
      );
    }

    cleaned.email =
      data.email?.trim() || null;
  }

  if (data.phone !== undefined) {
    cleaned.phone =
      data.phone?.trim() || null;
  }

  if (data.status !== undefined) {
    if (
      !ALLOWED_STATUSES.includes(data.status)
    ) {
      throw createValidationError(
        "Invalid contact status"
      );
    }

    cleaned.status = data.status;
  }

  if (data.tags !== undefined) {
    cleaned.tags = normalizeTags(data.tags);
  }

  if (data.source !== undefined) {
    cleaned.source =
      data.source?.trim() || null;
  }

  if (data.notes !== undefined) {
    cleaned.notes =
      data.notes?.trim() || null;
  }

  return cleaned;
}

async function listContacts({
  page,
  limit,
  status,
  tag,
  search,
  ownerId,
}) {
  return repository.findAll({
    page,
    limit,
    status,
    tag: tag?.trim(),
    search: search?.trim(),
    ownerId,
  });
}

/**
 * Get a contact only if it belongs to the
 * authenticated user.
 */
async function getContactById(id, ownerId) {
  const contact =
    await repository.findById(
      id,
      ownerId
    );

  if (!contact) {
    return null;
  }

  const activitySummary =
    await activitiesRepository.getSummary(
      id
    );

  return {
    ...contact,
    activity_summary: {
      total: Number(
        activitySummary.total || 0
      ),
      calls: Number(
        activitySummary.calls || 0
      ),
      emails: Number(
        activitySummary.emails || 0
      ),
      meetings: Number(
        activitySummary.meetings || 0
      ),
      notes: Number(
        activitySummary.notes || 0
      ),
      last_activity_at:
        activitySummary.last_activity_at ||
        null,
    },
  };
}

async function createContact(
  data,
  ownerId
) {
  if (!ownerId) {
    throw createValidationError(
      "Authenticated owner is required"
    );
  }

  const validated =
    validateCreateInput(data);

  return repository.create({
    ...validated,
    ownerId,
  });
}

async function updateContact(
  id,
  data,
  ownerId
) {
  if (!ownerId) {
    throw createValidationError(
      "Authenticated owner is required"
    );
  }

  const validated =
    validateUpdateInput(data);

  return repository.update(
    id,
    validated,
    ownerId
  );
}

async function deleteContact(
  id,
  ownerId
) {
  if (!ownerId) {
    throw createValidationError(
      "Authenticated owner is required"
    );
  }

  return repository.remove(
    id,
    ownerId
  );
}

module.exports = {
  listContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
};