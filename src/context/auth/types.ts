
import { Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authInitialized: boolean;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  loginWithUsername: (username: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
}

export type AuthContextType = AuthState & AuthActions;
