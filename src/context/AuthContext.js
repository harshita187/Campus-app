import React, { createContext, useState, useEffect, useContext } from "react";
import { authService } from "../services/authService";
import { disconnectSocket } from "../services/socket";

const AuthContext = createContext();

const getAuthErrorMessage = (error, fallbackMessage) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.code === "ERR_NETWORK") {
    return "Backend se connection nahi ho pa raha. Check karo ki API/server run ho raha hai.";
  }

  return fallbackMessage;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
    } catch (error) {
      localStorage.removeItem("token");
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const { token: newToken, user: userData } = response;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: getAuthErrorMessage(error, "Login failed"),
      };
    }
  };

  const signup = async (name, email, password, phone) => {
    try {
      await authService.signup(name, email, password, phone);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: getAuthErrorMessage(error, "Signup failed"),
      };
    }
  };

  const logout = () => {
    authService.logout().catch(() => null);
    disconnectSocket();
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
