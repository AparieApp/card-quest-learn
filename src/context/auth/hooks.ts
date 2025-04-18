
import { useCallback, useContext } from 'react';
import { AuthContext } from './AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { handleLoginError, processUserData, checkUsernameAvailability as checkUsername } from './utils';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthActions = () => {
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success('Logged in successfully!');
      // The auth state listener will handle updating the user/session
    } catch (error: any) {
      const message = handleLoginError(error);
      throw error;
    }
  }, []);

  const signup = useCallback(async (email: string, username: string, password: string): Promise<void> => {
    try {
      // Check if username is available
      const isAvailable = await checkUsername(username);
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
      // The auth state listener will handle updating the user/session
    } catch (error: any) {
      console.error('Signup error:', error);
      const message = error.message || 'Signup failed';
      toast.error(message);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      // The auth state listener will handle removing the user
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Logout failed');
    }
  }, []);

  const checkUsernameAvailability = useCallback(async (username: string): Promise<boolean> => {
    return await checkUsername(username);
  }, []);

  return {
    login,
    signup,
    logout,
    checkUsernameAvailability,
  };
};
