import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Employee, Role } from '../types.js';
import { authApi } from '../api/index.js';
import { useToast } from './ToastContext.js';

interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  role: Role | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ role: Role }>;
  register: (payload: { name: string; email: string; password: string; designation?: string; department?: string; phone?: string; address?: string }) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('dayflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [employee, setEmployee] = useState<Employee | null>(() => {
    const saved = localStorage.getItem('dayflow_employee');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('dayflow_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('dayflow_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.user);
          setEmployee(res.employee || null);
          localStorage.setItem('dayflow_user', JSON.stringify(res.user));
          if (res.employee) {
            localStorage.setItem('dayflow_employee', JSON.stringify(res.employee));
          }
        } catch (err) {
          console.warn('Stored token validation failed:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await authApi.login(email, password);
      setToken(res.token);
      setUser(res.user);
      setEmployee(res.employee || null);

      localStorage.setItem('dayflow_token', res.token);
      localStorage.setItem('dayflow_user', JSON.stringify(res.user));
      if (res.employee) {
        localStorage.setItem('dayflow_employee', JSON.stringify(res.employee));
      }

      success(`Welcome back, ${res.user.name}!`, 'Authenticated');
      return { role: res.role };
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to sign in. Check email and password.';
      error(message, 'Sign In Error');
      throw err;
    }
  };

  const register = async (payload: { name: string; email: string; password: string; designation?: string; department?: string; phone?: string; address?: string }) => {
    try {
      const res = await authApi.register(payload);
      setToken(res.token);
      setUser(res.user);
      setEmployee(res.employee || null);

      localStorage.setItem('dayflow_token', res.token);
      localStorage.setItem('dayflow_user', JSON.stringify(res.user));
      if (res.employee) {
        localStorage.setItem('dayflow_employee', JSON.stringify(res.employee));
      }

      success(`Account created successfully! Welcome to Dayflow.`, 'Registration Complete');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Registration failed. Please review the inputs.';
      error(message, 'Registration Error');
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setEmployee(null);
    localStorage.removeItem('dayflow_token');
    localStorage.removeItem('dayflow_user');
    localStorage.removeItem('dayflow_employee');
  };

  const refreshMe = async () => {
    try {
      const res = await authApi.getMe();
      setUser(res.user);
      setEmployee(res.employee || null);
      localStorage.setItem('dayflow_user', JSON.stringify(res.user));
      if (res.employee) {
        localStorage.setItem('dayflow_employee', JSON.stringify(res.employee));
      }
    } catch (e) {
      console.error('Failed refreshing current user profile:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        employee,
        role: user?.role || null,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshMe
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
