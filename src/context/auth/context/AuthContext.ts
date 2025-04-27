
import { createContext } from 'react';
import { AuthContextType } from '../types';

// Create the initial context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  authInitialized: false,
  login: async () => {},
  loginWithUsername: async () => {},
  signup: async () => {},
  logout: async () => {},
  checkUsernameAvailability: async () => true,
});

