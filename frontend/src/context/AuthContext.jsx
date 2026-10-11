import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('agritrade_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            localStorage.removeItem('agritrade_token');
            setToken(null);
            // Default to demo admin for instant smooth experience
            await loginAsDemo('admin');
          }
        } catch (err) {
          console.error('Auth init error:', err);
          await loginAsDemo('admin');
        }
      } else {
        // Auto-login as demo admin for immediate interactive preview
        await loginAsDemo('admin');
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginAsDemo = async (role = 'admin') => {
    try {
      const res = await api.demoLogin(role);
      if (res.success) {
        localStorage.setItem('agritrade_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true };
      }
    } catch (err) {
      console.error('Demo login failed:', err);
    }
    return { success: false };
  };

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success) {
      localStorage.setItem('agritrade_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('agritrade_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        loginAsDemo,
        logout,
        isAdmin: user?.role === 'admin' || user?.role === 'manager',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
