import {
  getToken,
  getRefreshToken,
  logout,
  refreshAccessToken,
} from "./auth";

const API_BASE_URL = "/api/v1";
/**
 * Perform an API request.
 *
 * Automatically:
 * - Adds the access token
 * - Refreshes an expired access token once
 * - Logs the user out if authentication fails
 */
export async function apiFetch(
  path,
  options = {}
) {
  const makeRequest = async () => {
    const token = getToken();

    const headers = new Headers(
      options.headers || {}
    );

    if (
      !headers.has("Content-Type") &&
      options.body &&
      !(options.body instanceof FormData)
    ) {
      headers.set(
        "Content-Type",
        "application/json"
      );
    }

    if (token) {
      headers.set(
        "Authorization",
        `Bearer ${token}`
      );
    }

    return fetch(
      `${API_BASE_URL}${path}`,
      {
        ...options,
        headers,
      }
    );
  };

  let response =
    await makeRequest();

  /**
   * Access token may have expired.
   * Try one refresh.
   */
  if (
    response.status === 401 &&
    getRefreshToken()
  ) {
    try {
      await refreshAccessToken();

      response =
        await makeRequest();
    } catch {
      logout();

      window.dispatchEvent(
        new Event("auth-expired")
      );
    }
  }

  /**
   * Refresh failed or there was
   * no refresh token.
   */
  if (response.status === 401) {
    logout();

    window.dispatchEvent(
      new Event("auth-expired")
    );
  }

  return response;
}