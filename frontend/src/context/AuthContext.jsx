import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  loginUser,
  registerUser,
  getCurrentUser,
  refreshAccessToken,
} from "../services/authService";


const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("access_token")
  );

  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refresh_token")
  );

  const [loading, setLoading] = useState(true);


  // =========================
  // SAVE TOKENS
  // =========================

  const saveTokens = (
    access,
    refresh = null
  ) => {
    localStorage.setItem(
      "access_token",
      access
    );

    setAccessToken(access);

    if (refresh) {
      localStorage.setItem(
        "refresh_token",
        refresh
      );

      setRefreshToken(refresh);
    }
  };


  // =========================
  // LOGIN
  // =========================

  const login = async (
    email,
    password
  ) => {
    const data = await loginUser(
      email,
      password
    );

    saveTokens(
      data.access_token,
      data.refresh_token
    );

    setUser(data.user);

    return data;
  };


  // =========================
  // REGISTER
  // =========================

  const register = async (
    name,
    email,
    password
  ) => {
    const data = await registerUser(
      name,
      email,
      password
    );

    return data;
  };


  // =========================
  // LOAD CURRENT USER
  // =========================

  const loadCurrentUser = async () => {
    const token =
      localStorage.getItem(
        "access_token"
      );

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const currentUser =
        await getCurrentUser(token);

      setUser(currentUser);
      setAccessToken(token);

    } catch (error) {

      const storedRefreshToken =
        localStorage.getItem(
          "refresh_token"
        );

      if (!storedRefreshToken) {
        logout();
        return;
      }

      try {
        const refreshData =
          await refreshAccessToken(
            storedRefreshToken
          );

        saveTokens(
          refreshData.access_token,
          storedRefreshToken
        );

        const currentUser =
          await getCurrentUser(
            refreshData.access_token
          );

        setUser(currentUser);

      } catch (refreshError) {
        logout();
      }

    } finally {
      setLoading(false);
    }
  };


  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "refresh_token"
    );

    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };


  // =========================
  // INITIAL AUTH CHECK
  // =========================

  useEffect(() => {
    loadCurrentUser();
  }, []);


  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


// =========================
// useAuth HOOK
// =========================

export const useAuth = () => {
  const context = useContext(
    AuthContext
  );

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};