import { apiFetch } from "./http";

async function handleResponse(response) {
  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("Invalid response from server");
  }

  if (!response.ok) {
    throw new Error(result?.error?.message || "Request failed");
  }

  return result;
}

export async function getTasks({
  page = 1,
  limit = 20,
  status = "",
  priority = "",
  search = "",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (status) params.set("status", status);
  if (priority) params.set("priority", priority);
  if (search) params.set("search", search);

  const response = await apiFetch(`/tasks?${params.toString()}`);
  return handleResponse(response);
}

export async function createTask(task) {
  const response = await apiFetch("/tasks", {
    method: "POST",
    body: JSON.stringify(task),
  });

  return handleResponse(response);
}

export async function updateTask(taskId, fields) {
  if (!taskId) {
    throw new Error("Task ID is required");
  }

  const response = await apiFetch(`/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(fields),
  });

  return handleResponse(response);
}

export async function deleteTask(taskId) {
  if (!taskId) {
    throw new Error("Task ID is required");
  }

  const response = await apiFetch(`/tasks/${taskId}`, {
    method: "DELETE",
  });

  return handleResponse(response);
}

export async function getTaskNotifications(days = 7) {
  const params = new URLSearchParams({
    days: String(days),
  });

  const response = await apiFetch(`/tasks/notifications?${params.toString()}`);
  return handleResponse(response);
}
