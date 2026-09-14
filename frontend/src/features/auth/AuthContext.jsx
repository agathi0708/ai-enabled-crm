import { createContext, useContext, useState } from "react";
import {
  loginUser,
  registerUser,
  logoutUser,
  refreshAccessToken,
} from "./authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken") || null
  );

  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refreshToken") || null
  );

  // Login
  const login = async (credentials) => {
    const response = await loginUser(credentials);

    const data = response.data;

    setUser(data.user);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);

    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );

    localStorage.setItem(
      "accessToken",
      data.accessToken
    );

    localStorage.setItem(
      "refreshToken",
      data.refreshToken
    );

    return data;
  };

  // Register
  const register = async (userData) => {
    const response = await registerUser(userData);

    return response.data;
  };

  // Refresh access token
  const refresh = async () => {
    if (!refreshToken) {
      return null;
    }

    const response = await refreshAccessToken(
      refreshToken
    );

    const data = response.data;

    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);

    localStorage.setItem(
      "accessToken",
      data.accessToken
    );

    localStorage.setItem(
      "refreshToken",
      data.refreshToken
    );

    return data;
  };

  // Logout
  const logout = async () => {
    if (refreshToken) {
      try {
        await logoutUser(refreshToken);
      } catch (error) {
        console.error("Logout API error:", error);
      }
    }

    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        login,
        register,
        refresh,
        logout,
        isAuthenticated: !!accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};