import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from sessionStorage
  useEffect(() => {
    try {
      const storedToken = sessionStorage.getItem('fintrack_token');
      const storedUser = sessionStorage.getItem('fintrack_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Failed to parse session auth state:', err);
      sessionStorage.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = response.data;

    setToken(receivedToken);
    setUser(receivedUser);

    sessionStorage.setItem('fintrack_token', receivedToken);
    sessionStorage.setItem('fintrack_user', JSON.stringify(receivedUser));

    return response.data;
  };

  const register = async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
    const { token: receivedToken, user: receivedUser } = response.data;

    setToken(receivedToken);
    setUser(receivedUser);

    sessionStorage.setItem('fintrack_token', receivedToken);
    sessionStorage.setItem('fintrack_user', JSON.stringify(receivedUser));

    return response.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('fintrack_token');
    sessionStorage.removeItem('fintrack_user');
  };

  const updateUserProfile = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      sessionStorage.setItem('fintrack_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        loading,
        login,
        register,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
