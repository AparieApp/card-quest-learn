
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from './types';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Safely fetch user profile without causing deadlocks
export const fetchUserProfile = async (userId: string) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
};

// Process user data and return formatted user object
export const processUserData = async (supabaseUser: User | null): Promise<AuthUser | null> => {
  try {
    if (!supabaseUser) {
      return null;
    }

    const profile = await fetchUserProfile(supabaseUser.id);
    
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      username: profile?.username || supabaseUser.email?.split('@')[0] || '',
    };
  } catch (error) {
    console.error('Error in processUserData:', error);
    return null;
  }
};

export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
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

export const handleLoginError = (error: any): string => {
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
  return message;
};
