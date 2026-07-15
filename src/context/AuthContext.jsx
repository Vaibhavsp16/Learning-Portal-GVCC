import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, initDB } from "../services/db";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize DB schemas
    initDB();
    
    // Check if user is logged in (session stored in localStorage)
    const storedUser = localStorage.getItem("current_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("current_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Simulate real API latency
      await new Promise(resolve => setTimeout(resolve, 500));
      const loggedUser = loginUser(email, password);
      localStorage.setItem("current_user", JSON.stringify(loggedUser));
      setUser(loggedUser);
      return loggedUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    try {
      // Simulate real API latency
      await new Promise(resolve => setTimeout(resolve, 500));
      const newUser = registerUser(username, email, password);
      // Automatically login user upon registration
      localStorage.setItem("current_user", JSON.stringify(newUser));
      setUser(newUser);
      return newUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("current_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
