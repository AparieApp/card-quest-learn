import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { AuthContextType, AuthUser, AuthState } from './types';
import { processUserData } from './utils';
import { useAuthActions } from './hooks';

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
  signup: async () => {},
  logout: async () => {},
  checkUsernameAvailability: async () => true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    ...initialState,
    authInitialized: false
  });
  const authActions = useAuthActions();

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
    <AuthContext.Provider value={{ ...state, ...authActions }}>
      {children}
    </AuthContext.Provider>
  );
};
