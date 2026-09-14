import apiClient from "../../api/client";


// Register a new user
export const registerUser = async (userData) => {
  const response = await apiClient.post(
    "/auth/register",
    userData
  );

  return response.data;
};


// Login user
export const loginUser = async (credentials) => {
  const response = await apiClient.post(
    "/auth/login",
    credentials
  );

  return response.data;
};


// Refresh access token
export const refreshAccessToken = async (refreshToken) => {
  const response = await apiClient.post(
    "/auth/refresh",
    {
      refreshToken,
    }
  );

  return response.data;
};


// Logout user
export const logoutUser = async (refreshToken) => {
  const response = await apiClient.post(
    "/auth/logout",
    {
      refreshToken,
    }
  );

  return response.data;
};

export const requestPasswordReset = async (email) => {
  const response = await apiClient.post(
    "/auth/password-reset/request",
    {
      email,
    }
  );

  return response.data;
};

export const confirmPasswordReset = async (
  token,
  newPassword
) => {
  const response = await apiClient.post(
    "/auth/password-reset/confirm",
    {
      token,
      new_password: newPassword,
    }
  );

  return response.data;
};