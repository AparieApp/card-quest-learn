
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { AuthContextType, AuthUser, AuthState } from './types';
import { processUserData } from './utils/userUtils';
import { useAuthActions } from './hooks/useAuthActions';

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
  
  // Use the hooks for auth actions
  const actions = useAuthActions();

  useEffect(() => {
    console.log('Initializing auth state...');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state change event:', event);
      
      // Update session immediately
      setState(prev => ({ 
        ...prev, 
        session: newSession,
        isAuthenticated: !!newSession?.user
      }));
      
      // Then process user data asynchronously to avoid deadlocks
      if (newSession?.user) {
        try {
          const userData = await processUserData(newSession.user);
          setState(prev => ({
            ...prev,
            user: userData
          }));
        } catch (error) {
          console.error('Error processing user data:', error);
        }
      } else {
        setState(prev => ({
          ...prev,
          user: null
        }));
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Got existing session:', session?.user?.id);
      
      // Update session immediately
      setState(prev => ({
        ...prev,
        session,
        isAuthenticated: !!session?.user,
        isLoading: false
      }));
      
      // Then process user data asynchronously
      if (session?.user) {
        try {
          const userData = await processUserData(session.user);
          setState(prev => ({
            ...prev,
            user: userData,
            authInitialized: true
          }));
        } catch (error) {
          console.error('Error processing user data:', error);
          setState(prev => ({
            ...prev,
            authInitialized: true
          }));
        }
      } else {
        setState(prev => ({
          ...prev,
          authInitialized: true
        }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ 
      ...state, 
      ...actions
    }}>
      {children}
    </AuthContext.Provider>
  );
};
