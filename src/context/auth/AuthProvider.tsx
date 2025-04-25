
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { AuthContextType, AuthUser, AuthState } from './types';
import { processUserData } from './utils';

// Create the initial auth state
const initialState: AuthState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  authInitialized: false,
};

// Create the context with default values
export const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: async () => {},
  loginWithUsername: async () => {},
  signup: async () => {},
  logout: async () => {},
  checkUsernameAvailability: async () => true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    ...initialState,
    authInitialized: false
  });
  
  // Instead of calling useAuthActions, define these functions directly here
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      
      console.log('Login successful:', data);
      // The auth state listener will handle updating the user/session
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Add username login functionality
  const loginWithUsername = async (username: string, password: string): Promise<void> => {
    try {
      // First, get the email associated with the username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', username)
        .single();

      if (profileError) {
        throw new Error('Username not found');
      }

      if (!profileData?.email) {
        throw new Error('Email not found for this username');
      }

      // Now login with the email
      const { data, error } = await supabase.auth.signInWithPassword({
        email: profileData.email,
        password,
      });

      if (error) {
        throw error;
      }
      
      console.log('Login with username successful:', data);
      // The auth state listener will handle updating the user/session
    } catch (error: any) {
      console.error('Login with username error:', error);
      throw error;
    }
  };

  const signup = async (email: string, username: string, password: string): Promise<void> => {
    try {
      // Check if username is available
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
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

      console.log('Signup successful:', authData);
      // The auth state listener will handle updating the user/session
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      console.log('Logout successful');
      // The auth state listener will handle removing the user
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
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

  useEffect(() => {
    console.log('Initializing auth state...');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('Auth state change event:', event);
      setState(prev => ({ 
        ...prev, 
        session: newSession,
        user: newSession?.user ? {
          id: newSession.user.id,
          email: newSession.user.email || '',
          username: newSession.user.user_metadata.username || newSession.user.email?.split('@')[0] || ''
        } : null,
        isAuthenticated: !!newSession?.user
      }));
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ? {
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.user_metadata.username || session.user.email?.split('@')[0] || ''
        } : null,
        isAuthenticated: !!session?.user,
        isLoading: false,
        authInitialized: true
      }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ 
      ...state, 
      login,
      loginWithUsername,
      signup,
      logout,
      checkUsernameAvailability,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
