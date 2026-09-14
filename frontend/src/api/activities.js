import { apiFetch } from "./http";

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
 * Get activities for a contact.
 */
export async function getContactActivities(
  contactId,
  {
    page = 1,
    limit = 20,
  } = {}
) {
  if (!contactId) {
    throw new Error(
      "Contact ID is required"
    );
  }

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await apiFetch(
    `/contacts/${contactId}/activities?${params.toString()}`
  );

  return handleResponse(response);
}

/**
 * Create a new activity.
 */
export async function createActivity({
  contact_id,
  type,
  notes,
}) {
  const response = await apiFetch(
    "/activities",
    {
      method: "POST",
      body: JSON.stringify({
        contact_id,
        type,
        notes,
      }),
    }
  );

  return handleResponse(response);
}

/**
 * Delete an activity.
 */
export async function deleteActivity(
  activityId
) {
  if (!activityId) {
    throw new Error(
      "Activity ID is required"
    );
  }

  const response = await apiFetch(
    `/activities/${activityId}`,
    {
      method: "DELETE",
    }
  );

  return handleResponse(response);
}