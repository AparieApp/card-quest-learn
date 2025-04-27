
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthState } from '../types';
import { processUserData } from '../utils/userUtils';

const initialState: AuthState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  authInitialized: false,
};

export const useAuthInitialization = () => {
  const [state, setState] = useState<AuthState>({
    ...initialState,
    authInitialized: false
  });
  
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

  return state;
};

