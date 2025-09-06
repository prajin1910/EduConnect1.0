import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  className?: string;
  phoneNumber?: string;
  verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    validateStoredAuth();
  }, []);

  const validateStoredAuth = () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        // Parse and validate token structure
        const tokenParts = storedToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const currentTime = Date.now() / 1000;
          
          // Check if token is expired (with 1 minute buffer)
          if (payload.exp && payload.exp > (currentTime + 60)) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            console.log('Valid token found, user authenticated');
          } else {
            // Token is expired or about to expire
            console.log('Token expired, clearing storage');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        } else {
          // Invalid token format
          console.log('Invalid token format, clearing storage');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        // Error parsing token, clear storage
        console.log('Error parsing token, clearing storage:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      }
    } else {
      console.log('No stored token or user found');
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    try {
      setIsValidating(true);
      const response = await authAPI.login({ email, password });
      const userData = {
        id: response.id,
        email: response.email,
        name: response.name,
        role: response.role,
        department: response.department,
        className: response.className,
        phoneNumber: response.phoneNumber,
        verified: response.verified,
      };

      setUser(userData);
      setToken(response.accessToken);
      
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log('Login successful, user data:', userData);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data || 'Login failed');
    } finally {
      setIsValidating(false);
    }
  };

  const logout = () => {
    console.log('Logging out user');
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('completedAssessments');
    
    // Clear any other app-specific storage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('app_') || key.startsWith('assessment_')) {
        localStorage.removeItem(key);
      }
    });
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading: loading || isValidating,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};