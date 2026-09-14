import { apiFetch } from "./http";

/**
 * Handle standard API responses.
 */
async function handleResponse(response) {
  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "Invalid response from server"
    );
  }

  if (!response.ok) {
    throw new Error(
      result?.error?.message ||
        "Request failed"
    );
  }

  return result;
}

/**
 * Get a single contact by ID.
 */
export async function getContactById(id) {
  if (!id) {
    throw new Error(
      "Contact ID is required"
    );
  }

  const response = await apiFetch(
    `/contacts/${id}`
  );

  return handleResponse(response);
}

/**
 * Get contacts with optional pagination
 * and filters.
 */
export async function getContacts({
  page = 1,
  limit = 20,
  status = "",
  tag = "",
  search = "",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (status) {
    params.set("status", status);
  }

  if (tag) {
    params.set("tag", tag);
  }

  if (search) {
    params.set("search", search);
  }

  const response = await apiFetch(
    `/contacts?${params.toString()}`
  );

  return handleResponse(response);
}

/**
 * Create a new contact.
 *
 * ownerId is intentionally not accepted.
 * The backend derives owner_id from the
 * authenticated JWT user.
 */
export async function createContact(
  contact
) {
  const response = await apiFetch(
    "/contacts",
    {
      method: "POST",
      body: JSON.stringify(contact),
    }
  );

  return handleResponse(response);
}

/**
 * Update an existing contact.
 *
 * Ownership is controlled by the backend
 * using the authenticated JWT user.
 */
export async function updateContact(
  id,
  fields
) {
  if (!id) {
    throw new Error(
      "Contact ID is required"
    );
  }

  const response = await apiFetch(
    `/contacts/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(fields),
    }
  );

  return handleResponse(response);
}

/**
 * Delete a contact.
 */
export async function deleteContact(id) {
  if (!id) {
    throw new Error(
      "Contact ID is required"
    );
  }

  const response = await apiFetch(
    `/contacts/${id}`,
    {
      method: "DELETE",
    }
  );

  if (response.status === 204) {
    return {
      data: null,
      meta: {},
      error: null,
    };
  }

  return handleResponse(response);
}

/**
 * Import contacts from a CSV file.
 *
 * The owner ID is NOT sent from the frontend.
 * The backend gets it from the authenticated JWT.
 */
export async function importContacts(
  file
) {
  if (!file) {
    throw new Error(
      "CSV file is required"
    );
  }

  const formData = new FormData();

  formData.append("file", file);

  const response = await apiFetch(
    "/contacts/import",
    {
      method: "POST",
      body: formData,
    }
  );

  return handleResponse(response);
}

/**
 * Convert a contact/lead into a deal.
 *
 * The backend:
 * - verifies the authenticated owner
 * - creates the deal
 * - marks the contact as converted
 * - performs the operation transactionally
 */
export async function convertContactToDeal(
  id
) {
  if (!id) {
    throw new Error(
      "Contact ID is required"
    );
  }

  const response = await apiFetch(
    `/contacts/${id}/convert`,
    {
      method: "POST",
    }
  );

  return handleResponse(response);
}