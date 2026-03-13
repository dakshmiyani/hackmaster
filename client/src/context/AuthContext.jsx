import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const loginUser = async (credentials) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_BASE_URL}/open/api/auth/login`,
      credentials
    );

    const { data, success, message } = response.data;

    if (!success) {
      return { success: false, message: message || "Login failed" };
    }

    setUser(data.user);
    localStorage.setItem("user", JSON.stringify(data.user));

    if (data?.token) {
      localStorage.setItem("token", data.token);
    }

    return { success: true, user: data.user };

  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Server connection failed"
    };
  }
};

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;