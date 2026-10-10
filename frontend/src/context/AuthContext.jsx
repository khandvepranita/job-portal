import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await authApi.login(credentials);
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await authApi.register(userData);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error("Logout API call failed", e);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const hasRole = (roleName) => {
    if (!user || !user.role) return false;
    const formatted = roleName.startsWith('ROLE_') ? roleName : `ROLE_${roleName}`;
    return user.role === formatted;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    hasRole,
    isAdmin: hasRole('ROLE_ADMIN'),
    isManager: hasRole('ROLE_MANAGER'),
    isUser: hasRole('ROLE_USER'),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
