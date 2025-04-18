
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
  const [state, setState] = useState<AuthState>(initialState);
  const authActions = useAuthActions();

  // Initialize auth state
  useEffect(() => {
    let authTimeout: NodeJS.Timeout | null = null;
    
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth state...');
        setState(prev => ({ ...prev, isLoading: true }));

        // First set up the auth state listener to ensure we don't miss any events
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, newSession) => {
            console.log('Auth state change event:', event);
            
            // Synchronously update session state
            setState(prev => ({ 
              ...prev, 
              session: newSession 
            }));
            
            // Important: Don't make Supabase calls here directly
            // Use setTimeout to prevent deadlocks
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              setTimeout(() => {
                if (newSession?.user) {
                  processUserData(newSession.user).then(user => {
                    if (user) {
                      setState(prev => ({ 
                        ...prev, 
                        user, 
                        isAuthenticated: true 
                      }));
                    }
                  });
                }
              }, 0);
            } else if (event === 'SIGNED_OUT') {
              setState(prev => ({ 
                ...prev, 
                user: null, 
                isAuthenticated: false 
              }));
            }
          }
        );

        // After setting up listener, check for existing session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          throw sessionError;
        }

        console.log('Session check complete:', !!sessionData.session);
        setState(prev => ({ 
          ...prev, 
          session: sessionData.session
        }));

        if (sessionData.session?.user) {
          const user = await processUserData(sessionData.session.user);
          setState(prev => ({ 
            ...prev, 
            user,
            isAuthenticated: !!user,
          }));
        }

        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          authInitialized: true
        }));

        return () => {
          subscription.unsubscribe();
          if (authTimeout) {
            clearTimeout(authTimeout);
          }
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        setState(prev => ({ 
          ...prev, 
          user: null, 
          session: null,
          isLoading: false,
          authInitialized: true
        }));
      }
    };

    initializeAuth();

    // Authentication timeout to prevent infinite loading
    authTimeout = setTimeout(() => {
      setState(prev => {
        if (prev.isLoading) {
          console.log('Authentication timed out. Resetting loading state.');
          return { ...prev, isLoading: false, authInitialized: true };
        }
        return prev;
      });
    }, 5000); // 5 seconds timeout

    return () => {
      if (authTimeout) {
        clearTimeout(authTimeout);
      }
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        ...authActions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
