import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../axiosConfig';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const isAuthenticated = !!user;

  // Derive isAdmin boolean from user.role
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    // On app mount, check current auth status by calling /auth/me
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        if (response.data?.user) {
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch {
        setUser(null);
        localStorage.removeItem('user');
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      // Expect response: { user, message }
      if (response.data?.user) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data.user;
      } else {
        throw new Error('Invalid login response: missing user');
      }
    } catch (error) {
      setUser(null);
      localStorage.removeItem('user');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout'); // This clears the cookie in backend
    } catch (err) {
      console.error('Logout error:', err);
    }
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
