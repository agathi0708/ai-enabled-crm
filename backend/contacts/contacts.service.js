const repository = require("./contacts.repository");
const activitiesRepository = require("../activities/activities.repository");
const {
  validateCreateContact,
  validateUpdateContact,
} = require("./contacts.validation");

function normalizeTags(tags) {
  if (tags === undefined) {
    return undefined;
  }

  return tags
    .map((tag) => tag.trim())
    .filter(Boolean);
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
  const contact = await repository.findById(
    id,
    ownerId
  );

  if (!contact) {
    return null;
  }

  const activitySummary =
    await activitiesRepository.getSummary(id);

  return {
    ...contact,
    activity_summary: {
      total: Number(activitySummary.total || 0),
      calls: Number(activitySummary.calls || 0),
      emails: Number(activitySummary.emails || 0),
      meetings: Number(activitySummary.meetings || 0),
      notes: Number(activitySummary.notes || 0),
      last_activity_at:
        activitySummary.last_activity_at || null,
    },
  };
}

async function createContact(data, ownerId) {
  if (!ownerId) {
    const error = new Error(
      "Authenticated owner is required"
    );
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  validateCreateContact(data);

  const tags = normalizeTags(data.tags);

  return repository.create({
    ownerId,
    name: data.name.trim(),
    company: data.company?.trim() || null,
    email: data.email?.trim() || null,
    phone: data.phone?.trim() || null,
    status: data.status || "new",
    tags: tags || [],
    source: data.source?.trim() || null,
    notes: data.notes?.trim() || null,
  });
}

async function updateContact(id, data, ownerId) {
  if (!ownerId) {
    const error = new Error(
      "Authenticated owner is required"
    );
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  validateUpdateContact(data);

  const fields = {
    ...data,
  };

  if (fields.name !== undefined) {
    fields.name = fields.name.trim();
  }

  if (fields.company !== undefined) {
    fields.company =
      fields.company?.trim() || null;
  }

  if (fields.email !== undefined) {
    fields.email =
      fields.email?.trim() || null;
  }

  if (fields.phone !== undefined) {
    fields.phone =
      fields.phone?.trim() || null;
  }

  if (fields.source !== undefined) {
    fields.source =
      fields.source?.trim() || null;
  }

  if (fields.notes !== undefined) {
    fields.notes =
      fields.notes?.trim() || null;
  }

  if (fields.tags !== undefined) {
    fields.tags = normalizeTags(fields.tags);
  }

  return repository.update(
    id,
    fields,
    ownerId
  );
}

async function deleteContact(id, ownerId) {
  if (!ownerId) {
    const error = new Error(
      "Authenticated owner is required"
    );
    error.code = "VALIDATION_ERROR";
    throw error;
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