import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../services/api';
import { getToken, setToken, removeToken, verifyToken } from '../services/api';
import * as jose from 'jose';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
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
  children: ReactNode;
}

// User storage management
const getUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return null;
    }
  }
  return null;
};

const setUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

const removeUser = (): void => {
  localStorage.removeItem('user');
};

// Decode JWT token to get user information
const decodeToken = async (token: string): Promise<User | null> => {
  try {
    const decoded = jose.decodeJwt(token);
    if (decoded && typeof decoded === 'object') {
      return {
        id: decoded.sub ? parseInt(decoded.sub as string) : 0,
        username: decoded.username as string || 'Unknown',
        email: decoded.email as string || '',
        roles: decoded.roles as string[] || [],
      };
    }
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
  }
  return null;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();
      const storedUser = getUser();

      if (token && storedUser) {
        try {
          const isValid = await verifyToken(token);
          if (isValid) {
            // Use stored user data
            setUserState(storedUser);
          } else {
            // Token is invalid, try to decode it to get fresh user data
            const decodedUser = await decodeToken(token);
            if (decodedUser) {
              setUserState(decodedUser);
              setUser(decodedUser);
            } else {
              // Clear invalid data
              removeToken();
              removeUser();
            }
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          removeToken();
          removeUser();
        }
      } else if (token) {
        // We have a token but no stored user, try to decode it
        try {
          const decodedUser = await decodeToken(token);
          if (decodedUser) {
            setUserState(decodedUser);
            setUser(decodedUser);
          } else {
            removeToken();
          }
        } catch (error) {
          console.error('Failed to decode token:', error);
          removeToken();
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (token: string, userData: User) => {
    setToken(token);
    setUser(userData);
    setUserState(userData);
  };

  const logout = () => {
    removeToken();
    removeUser();
    setUserState(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};