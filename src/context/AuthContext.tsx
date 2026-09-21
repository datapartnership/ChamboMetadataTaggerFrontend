import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiResponse, User, AuthContextType, LoginResponse } from '../types';
import { API_URL } from '../config';

const AuthContext = createContext<AuthContextType | undefined>(undefined);




interface AuthProviderProps {
  children: ReactNode;
  onLogout?: () => void;
  restoreStoredSession?: boolean;
}

export const AuthProvider = ({ children, onLogout, restoreStoredSession = true }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!restoreStoredSession) {
      return;
    }

    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, [restoreStoredSession]);

  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/Auth/login`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const result: LoginResponse = await response.json();

      if (result.success && result.data) {
        setToken(result.data.token);
        setUser(result.data.user);

        localStorage.setItem('auth_token', result.data.token);
        localStorage.setItem('auth_user', JSON.stringify(result.data.user));
      } else {
        throw new Error(result.message || 'Login failed');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const establishEntraSession = async (entraAccessToken: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/Auth/me`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${entraAccessToken}`,
        },
      });
      const result: ApiResponse<User> = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || 'Microsoft account is not authorized for this application');
      }

      setToken(entraAccessToken);
      setUser(result.data);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    onLogout?.();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, establishEntraSession, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
