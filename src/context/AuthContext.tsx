
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';

// Define User type based on specs
interface User {
  id: string;
  email: string;
  username: string;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  checkUsernameAvailability: async () => true,
});

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // For MVP we'll simulate auth with localStorage
  // In the future this would be replaced with Supabase auth
  useEffect(() => {
    const storedUser = localStorage.getItem('flashcard_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // For demo purposes - in real app, this would validate against Supabase
      const mockUsers = JSON.parse(localStorage.getItem('flashcard_users') || '[]');
      const foundUser = mockUsers.find((u: any) => 
        u.email === email && u.password === password
      );
      
      if (foundUser) {
        const userObj = {
          id: foundUser.id,
          email: foundUser.email,
          username: foundUser.username
        };
        setUser(userObj);
        localStorage.setItem('flashcard_user', JSON.stringify(userObj));
        toast.success(`Welcome back, ${foundUser.username}!`);
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };
  
  const signup = async (email: string, username: string, password: string) => {
    try {
      // For demo purposes - in real app, this would create a user in Supabase
      const mockUsers = JSON.parse(localStorage.getItem('flashcard_users') || '[]');
      
      // Check if email or username already exists
      if (mockUsers.some((u: any) => u.email === email)) {
        throw new Error('Email already in use');
      }
      
      if (mockUsers.some((u: any) => u.username === username)) {
        throw new Error('Username already taken');
      }
      
      const newUser = {
        id: `user_${Date.now()}`,
        email,
        username,
        password // In real app, we'd never store plain passwords
      };
      
      mockUsers.push(newUser);
      localStorage.setItem('flashcard_users', JSON.stringify(mockUsers));
      
      const userObj = {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username
      };
      
      setUser(userObj);
      localStorage.setItem('flashcard_user', JSON.stringify(userObj));
      toast.success(`Welcome, ${username}!`);
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
      throw error;
    }
  };
  
  const logout = async () => {
    localStorage.removeItem('flashcard_user');
    setUser(null);
    toast.success('Logged out successfully');
  };
  
  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    // For demo purposes
    const mockUsers = JSON.parse(localStorage.getItem('flashcard_users') || '[]');
    return !mockUsers.some((u: any) => u.username === username);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        checkUsernameAvailability,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
