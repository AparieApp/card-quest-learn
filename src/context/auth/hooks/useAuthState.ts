
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { AuthUser, AuthState } from '../types'; // Import from types instead of redefining
import { supabase } from '@/integrations/supabase/client';

export const useAuthState = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
    authInitialized: false
  });

  useEffect(() => {
    console.log('Initializing auth state...');
    
    // Set up auth state listener FIRST to avoid race conditions
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

  return state;
};
