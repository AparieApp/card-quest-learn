
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { checkUsernameAvailability as checkUsername } from '../utils/userUtils';

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
      
      console.log('Login successful:', data);
      toast.success('Logged in successfully!');
      // The auth state listener will handle updating the user/session
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  // Add username login functionality
  const loginWithUsername = useCallback(async (username: string, password: string): Promise<void> => {
    try {
      // First, get the user information associated with the username
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('username', username)
        .single();

      if (userError) {
        throw new Error('Username not found');
      }

      if (!userData) {
        throw new Error('User data not found for this username');
      }
      
      // Use the auth admin API to get the user's email
      const { data: authUserData, error: authUserError } = await supabase.rpc(
        'get_user_email_by_id', 
        { user_id: userData.id }
      );
        
      if (authUserError || !authUserData) {
        throw new Error('Could not retrieve email for this username');
      }
      
      // Now login with the email
      const emailFromRPC = authUserData as string;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailFromRPC,
        password,
      });

      if (error) {
        throw error;
      }
      
      console.log('Login with username successful:', data);
      toast.success('Logged in successfully!');
      // The auth state listener will handle updating the user/session
    } catch (error: any) {
      console.error('Login with username error:', error);
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

      console.log('Signup successful:', authData);
      toast.success('Account created successfully!');
      // The auth state listener will handle updating the user/session
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      console.log('Logout successful');
      toast.success('Logged out successfully');
      // The auth state listener will handle removing the user
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  }, []);

  const checkUsernameAvailability = useCallback(async (username: string): Promise<boolean> => {
    return await checkUsername(username);
  }, []);

  return {
    login,
    loginWithUsername,
    signup,
    logout,
    checkUsernameAvailability,
  };
};
