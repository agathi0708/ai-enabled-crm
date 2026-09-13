import axios from "axios";


// =========================
// API CONFIGURATION
// =========================

const API_URL = import.meta.env.VITE_API_URL;


const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


// =========================
// LOGIN
// =========================

export const loginUser = async (email, password) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};


// =========================
// REGISTER
// =========================

export const registerUser = async (
  name,
  email,
  password
) => {
  const response = await api.post("/auth/register", {
    name,
    email,
    password,
  });

  return response.data;
};


// =========================
// GET CURRENT USER
// =========================

export const getCurrentUser = async (token) => {
  const response = await api.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};


// =========================
// REFRESH ACCESS TOKEN
// =========================

export const refreshAccessToken = async (
  refreshToken
) => {
  const response = await api.post("/auth/refresh", {
    refresh_token: refreshToken,
  });

  return response.data;
};


// =========================
// REQUEST PASSWORD RESET
// =========================

export const requestPasswordReset = async (email) => {
  const response = await api.post(
    "/auth/password-reset/request",
    {
      email,
    }
  );

  return response.data;
};


// =========================
// RESET PASSWORD
// =========================

export const resetPassword = async (
  token,
  newPassword
) => {
  const response = await api.post(
    "/auth/password-reset",
    {
      token,
      new_password: newPassword,
    }
  );

  return response.data;
};


// =========================
// ADMIN - INVITE USER
// =========================

export const inviteUser = async (
  name,
  email,
  password,
  role,
  token
) => {
  const response = await api.post(
    "/auth/admin/invite",
    {
      name,
      email,
      password,
      role,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};


// =========================
// ADMIN - DEACTIVATE USER
// =========================

export const deactivateUser = async (
  userId,
  token
) => {
  const response = await api.patch(
    `/auth/admin/users/${userId}/deactivate`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};