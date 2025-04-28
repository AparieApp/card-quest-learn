
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '../types';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { checkRateLimit, secureCompare } from '@/utils/secureValidation';

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
// This function uses constant time processing and rate limiting
// to prevent username enumeration attacks
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    // Rate limit username checks to prevent enumeration
    if (!checkRateLimit(`username_check_${username.substring(0, 2)}`, 5, 60000)) {
      // Add random delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
      toast.error('Too many requests. Please try again later.');
      return false;
    }
    
    // Always introduce a small random delay to prevent timing attacks
    const delay = Math.random() * 300 + 100;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Use unique constraint to ensure usernames are unique
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
    // Default to unavailable on error for security
    return false;
  }
};
