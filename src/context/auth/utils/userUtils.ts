
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '../types';
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

// Check username availability against the profiles table
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    // Use the unique constraint we added to ensure usernames are unique
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username);

    if (error) {
      console.error('Error checking username availability:', error);
      throw error;
    }

    return data.length === 0;
  } catch (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
};
