const repository = require("./contacts.repository");

const ALLOWED_STATUSES = [
  "new",
  "hot",
  "warm",
  "cold",
  "converted",
];

function normalizeTags(tags) {
  if (tags === undefined) {
    return undefined;
  }

  if (!Array.isArray(tags)) {
    throw new Error("Tags must be an array");
  }

  return tags
    .map((tag) => String(tag).trim())
    .filter(Boolean);
}

function validateCreateInput(data) {
  if (!data.name || typeof data.name !== "string") {
    const error = new Error("Name is required");
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  const name = data.name.trim();

  if (name.length < 1 || name.length > 120) {
    const error = new Error("Name must be between 1 and 120 characters");
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  if (data.status && !ALLOWED_STATUSES.includes(data.status)) {
    const error = new Error("Invalid contact status");
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  if (
    data.email !== undefined &&
    data.email !== null &&
    data.email !== "" &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
  ) {
    const error = new Error("Invalid email address");
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  const tags = normalizeTags(data.tags);

  return {
    ...data,
    name,
    company: data.company?.trim() || null,
    email: data.email?.trim() || null,
    phone: data.phone?.trim() || null,
    source: data.source?.trim() || null,
    notes: data.notes?.trim() || null,
    status: data.status || "new",
    tags: tags || [],
  };
}

function validateUpdateInput(data) {
  const cleaned = {};

  if (data.name !== undefined) {
    if (typeof data.name !== "string") {
      const error = new Error("Name must be a string");
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    const name = data.name.trim();

    if (name.length < 1 || name.length > 120) {
      const error = new Error("Name must be between 1 and 120 characters");
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    cleaned.name = name;
  }

  if (data.company !== undefined) {
    cleaned.company = data.company?.trim() || null;
  }

  if (data.email !== undefined) {
    if (
      data.email !== null &&
      data.email !== "" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
    ) {
      const error = new Error("Invalid email address");
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    cleaned.email = data.email?.trim() || null;
  }

  if (data.phone !== undefined) {
    cleaned.phone = data.phone?.trim() || null;
  }

  if (data.status !== undefined) {
    if (!ALLOWED_STATUSES.includes(data.status)) {
      const error = new Error("Invalid contact status");
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    cleaned.status = data.status;
  }

  if (data.tags !== undefined) {
    cleaned.tags = normalizeTags(data.tags);
  }

  if (data.source !== undefined) {
    cleaned.source = data.source?.trim() || null;
  }

  if (data.notes !== undefined) {
    cleaned.notes = data.notes?.trim() || null;
  }

  return cleaned;
}

async function listContacts(filters) {
  const page = Math.max(Number(filters.page) || 1, 1);
  const limit = Math.min(Math.max(Number(filters.limit) || 20, 1), 100);

  return repository.findAll({
    page,
    limit,
    status: filters.status,
    tag: filters.tag,
    search: filters.search?.trim(),
    ownerId: filters.ownerId,
  });
}

async function getContactById(id) {
  return repository.findById(id);
}

async function createContact(data) {
  const validated = validateCreateInput(data);

  return repository.create(validated);
}

async function updateContact(id, data) {
  const validated = validateUpdateInput(data);

  return repository.update(id, validated);
}

async function deleteContact(id) {
  return repository.remove(id);
}

module.exports = {
  listContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
};
