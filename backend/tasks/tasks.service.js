const repository = require("./tasks.repository");

const VALID_PRIORITIES = ["low", "medium", "high"];
const VALID_STATUSES = ["todo", "in_progress", "completed"];

function createValidationError(message) {
  const error = new Error(message);
  error.code = "VALIDATION_ERROR";
  return error;
}

function normalizeDueDate(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const dateValue = new Date(value);

  if (Number.isNaN(dateValue.getTime())) {
    throw createValidationError("due_date must be a valid date");
  }

  return dateValue.toISOString();
}

function validateTaskInput(data = {}) {
  const title = typeof data.title === "string" ? data.title.trim() : "";

  if (!title) {
    throw createValidationError("title is required");
  }

  if (
    !data.contact_id ||
    typeof data.contact_id !== "string" ||
    !data.contact_id.trim()
  ) {
    throw createValidationError("contact_id is required");
  }

  const priority = data.priority || "medium";

  if (!VALID_PRIORITIES.includes(priority)) {
    throw createValidationError("priority must be low, medium, or high");
  }

  const status = data.status || "todo";

  if (!VALID_STATUSES.includes(status)) {
    throw createValidationError("status must be todo, in_progress, or completed");
  }

  let description = data.description;

  if (description !== undefined && description !== null) {
    if (typeof description !== "string") {
      throw createValidationError("description must be a string");
    }

    description = description.trim();
  }

  return {
    contactId: data.contact_id.trim(),
    title,
    priority,
    status,
    description: description || null,
    dueDate: normalizeDueDate(data.due_date),
  };
}

async function listTasks({ ownerId, page, limit, status, priority, search }) {
  if (!ownerId) {
    const error = new Error("Authenticated owner is required");
    error.code = "UNAUTHORIZED";
    throw error;
  }

  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

  return repository.findAll({
    ownerId,
    page: safePage,
    limit: safeLimit,
    status,
    priority,
    search,
  });
}

async function createTask(data, ownerId) {
  if (!ownerId) {
    const error = new Error("Authenticated owner is required");
    error.code = "UNAUTHORIZED";
    throw error;
  }

  const payload = validateTaskInput(data);

  const isOwnerContact = await repository.contactBelongsToOwner(
    payload.contactId,
    ownerId
  );

  if (!isOwnerContact) {
    const error = new Error("Contact not found for this user");
    error.code = "NOT_FOUND";
    throw error;
  }

  return repository.create({
    ownerId,
    contactId: payload.contactId,
    title: payload.title,
    description: payload.description,
    priority: payload.priority,
    status: payload.status,
    dueDate: payload.dueDate,
  });
}

async function updateTask(id, data, ownerId) {
  if (!ownerId) {
    const error = new Error("Authenticated owner is required");
    error.code = "UNAUTHORIZED";
    throw error;
  }

  if (!id || typeof id !== "string") {
    throw createValidationError("Task ID is required");
  }

  if (!data || Object.keys(data).length === 0) {
    throw createValidationError("No task fields provided");
  }

  const fields = {};

  if (data.title !== undefined) {
    const title = typeof data.title === "string" ? data.title.trim() : "";

    if (!title) {
      throw createValidationError("title is required");
    }

    fields.title = title;
  }

  if (data.contact_id !== undefined) {
    if (!data.contact_id || typeof data.contact_id !== "string") {
      throw createValidationError("contact_id is required");
    }

    const contactId = data.contact_id.trim();
    const isOwnerContact = await repository.contactBelongsToOwner(
      contactId,
      ownerId
    );

    if (!isOwnerContact) {
      const error = new Error("Contact not found for this user");
      error.code = "NOT_FOUND";
      throw error;
    }

    fields.contact_id = contactId;
  }

  if (data.description !== undefined) {
    if (data.description === null || data.description === "") {
      fields.description = null;
    } else if (typeof data.description === "string") {
      fields.description = data.description.trim();
    } else {
      throw createValidationError("description must be a string");
    }
  }

  if (data.priority !== undefined) {
    if (!VALID_PRIORITIES.includes(data.priority)) {
      throw createValidationError("priority must be low, medium, or high");
    }

    fields.priority = data.priority;
  }

  if (data.status !== undefined) {
    if (!VALID_STATUSES.includes(data.status)) {
      throw createValidationError("status must be todo, in_progress, or completed");
    }

    fields.status = data.status;
  }

  if (data.due_date !== undefined) {
    fields.due_date = normalizeDueDate(data.due_date);
  }

  const task = await repository.update(id, fields, ownerId);

  if (!task) {
    const error = new Error("Task not found");
    error.code = "NOT_FOUND";
    throw error;
  }

  return task;
}

async function deleteTask(id, ownerId) {
  if (!ownerId) {
    const error = new Error("Authenticated owner is required");
    error.code = "UNAUTHORIZED";
    throw error;
  }

  if (!id || typeof id !== "string") {
    throw createValidationError("Task ID is required");
  }

  const task = await repository.remove(id, ownerId);

  if (!task) {
    const error = new Error("Task not found");
    error.code = "NOT_FOUND";
    throw error;
  }

  return task;
}

async function getTaskNotifications(ownerId, days = 7) {
  if (!ownerId) {
    const error = new Error("Authenticated owner is required");
    error.code = "UNAUTHORIZED";
    throw error;
  }

  const safeDays = Math.max(Number(days) || 7, 1);

  return repository.getNotifications(ownerId, safeDays);
}

module.exports = {
  validateTaskInput,
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskNotifications,
};
