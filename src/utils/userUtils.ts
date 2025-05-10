
import { supabase } from "@/integrations/supabase/client";

// In-memory cache for username lookups
const usernameCache = new Map<string, string>();
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get username for a given user ID with caching
 */
export const getUsernameById = async (userId: string): Promise<string> => {
  // Check cache first
  if (usernameCache.has(userId)) {
    return usernameCache.get(userId) || 'Unknown User';
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      console.error('Error fetching username:', error);
      return 'Unknown User';
    }

    // Cache the username
    usernameCache.set(userId, data.username);
    
    // Set cache to expire after some time
    setTimeout(() => {
      usernameCache.delete(userId);
    }, CACHE_EXPIRY_MS);

    return data.username;
  } catch (error) {
    console.error('Error in getUsernameById:', error);
    return 'Unknown User';
  }
};

/**
 * Clear username from cache (use when username is updated)
 */
export const clearUsernameCache = (userId: string): void => {
  usernameCache.delete(userId);
};

/**
 * Clear entire username cache
 */
export const clearAllUsernameCache = (): void => {
  usernameCache.clear();
};
