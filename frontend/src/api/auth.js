const API_BASE_URL = "/api/v1";

const ACCESS_TOKEN_KEY =
  "ai_crm_access_token";

const REFRESH_TOKEN_KEY =
  "ai_crm_refresh_token";

const USER_KEY =
  "ai_crm_user";

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
 * Login.
 */
export async function login(
  email,
  password
) {
  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  const result =
    await handleResponse(response);

  const data = result?.data;

  if (
    !data?.access_token ||
    !data?.refresh_token ||
    !data?.user
  ) {
    throw new Error(
      "Authentication response is incomplete"
    );
  }

  localStorage.setItem(
    ACCESS_TOKEN_KEY,
    data.access_token
  );

  localStorage.setItem(
    REFRESH_TOKEN_KEY,
    data.refresh_token
  );

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(data.user)
  );

  return data;
}

/**
 * Get the current access token.
 */
export function getToken() {
  return localStorage.getItem(
    ACCESS_TOKEN_KEY
  );
}

/**
 * Get the current refresh token.
 */
export function getRefreshToken() {
  return localStorage.getItem(
    REFRESH_TOKEN_KEY
  );
}

/**
 * Get the stored user.
 */
export function getStoredUser() {
  const value =
    localStorage.getItem(USER_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

/**
 * Store updated authentication data.
 */
export function saveAuthData({
  accessToken,
  refreshToken,
  user,
}) {
  if (accessToken) {
    localStorage.setItem(
      ACCESS_TOKEN_KEY,
      accessToken
    );
  }

  if (refreshToken) {
    localStorage.setItem(
      REFRESH_TOKEN_KEY,
      refreshToken
    );
  }

  if (user) {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(user)
    );
  }
}

/**
 * Refresh the access token.
 */
export async function refreshAccessToken() {
  const refreshToken =
    getRefreshToken();

  if (!refreshToken) {
    throw new Error(
      "Refresh token is not available"
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/auth/refresh`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    }
  );

  const result =
    await handleResponse(response);

  const accessToken =
    result?.data?.access_token;

  if (!accessToken) {
    throw new Error(
      "Refresh response is incomplete"
    );
  }

  localStorage.setItem(
    ACCESS_TOKEN_KEY,
    accessToken
  );

  return accessToken;
}

/**
 * Get the current authenticated user.
 */
export async function getCurrentUser() {
  const token = getToken();

  if (!token) {
    throw new Error(
      "Authentication token is not available"
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/auth/me`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result =
    await handleResponse(response);

  return result.data;
}

/**
 * Check whether the user is authenticated.
 */
export function isAuthenticated() {
  return Boolean(getToken());
}

/**
 * Clear all authentication data.
 */
export function logout() {
  localStorage.removeItem(
    ACCESS_TOKEN_KEY
  );

  localStorage.removeItem(
    REFRESH_TOKEN_KEY
  );

  localStorage.removeItem(
    USER_KEY
  );
}