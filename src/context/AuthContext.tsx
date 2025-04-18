
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthUser {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  checkUsernameAvailability: async () => true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Set up auth state listener first to capture all auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        // Handle auth events appropriately
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await refreshUser(session?.user || null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session?.user) {
          await refreshUser(session.user);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshUser = async (supabaseUser: User | null) => {
    if (!supabaseUser) {
      setUser(null);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setUser(null);
        return;
      }

      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        username: profile?.username || supabaseUser.email?.split('@')[0] || '',
      });
    } catch (error) {
      console.error('Error in refreshUser:', error);
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success('Logged in successfully!');
      return data;
    } catch (error: any) {
      console.error('Login error:', error);
      let message = 'Login failed. Please check your credentials and try again.';
      
      // Handle specific error messages for better user feedback
      if (error.message) {
        if (error.message.includes('Invalid login credentials')) {
          message = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('Email not confirmed')) {
          message = 'Please verify your email before logging in.';
        } else {
          message = error.message;
        }
      }
      
      toast.error(message);
      throw error;
    }
  };

  const signup = async (email: string, username: string, password: string) => {
    try {
      // Check if username is available
      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        throw new Error('Username already taken');
      }

      // Create the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      toast.success('Account created successfully!');
      return authData;
    } catch (error: any) {
      console.error('Signup error:', error);
      const message = error.message || 'Signup failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      setUser(null);
      setSession(null);
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Logout failed');
    }
  };

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username);

      if (error) {
        throw error;
      }

      return data.length === 0;
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
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

export const useAuth = () => useContext(AuthContext);
