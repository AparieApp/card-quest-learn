
import { supabase } from "@/integrations/supabase/client";
import { ValidationError, DataError } from '@/utils/errorHandling';
import { isValidUUID } from '@/utils/secureValidation';

export const followedDeckService = {
  // Get all decks followed by the current user
  async getFollowedDecks(): Promise<string[]> {
    try {
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No user found when fetching followed decks');
        return [];
      }
      
      const { data, error } = await supabase
        .from('followed_decks')
        .select('deck_id')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching followed decks:', error);
        throw new DataError('Failed to fetch followed decks');
      }
      
      return data.map(item => item.deck_id);
    } catch (error) {
      console.error('Error in getFollowedDecks:', error);
      if (error instanceof DataError) {
        throw error;
      }
      throw new DataError('Failed to fetch followed decks');
    }
  },
  
  // Follow a deck
  async followDeck(deckId: string): Promise<void> {
    try {
      if (!deckId || !isValidUUID(deckId)) {
        throw new ValidationError('Invalid deck ID');
      }
      
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new ValidationError('You must be logged in to follow a deck');
      }
      
      const { error } = await supabase
        .from('followed_decks')
        .insert({ 
          deck_id: deckId,
          user_id: user.id
        });
      
      if (error) {
        // Check if it's a unique constraint violation (already following)
        if (error.code === '23505') {
          // This is fine, user is already following this deck
          return;
        }
        console.error('Error following deck:', error);
        throw new DataError('Failed to follow deck');
      }
    } catch (error) {
      console.error('Error in followDeck:', error);
      if (error instanceof ValidationError || error instanceof DataError) {
        throw error;
      }
      throw new DataError('Failed to follow deck');
    }
  },
  
  // Unfollow a deck
  async unfollowDeck(deckId: string): Promise<void> {
    try {
      if (!deckId || !isValidUUID(deckId)) {
        throw new ValidationError('Invalid deck ID');
      }
      
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new ValidationError('You must be logged in to unfollow a deck');
      }
      
      const { error } = await supabase
        .from('followed_decks')
        .delete()
        .eq('deck_id', deckId)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error unfollowing deck:', error);
        throw new DataError('Failed to unfollow deck');
      }
    } catch (error) {
      console.error('Error in unfollowDeck:', error);
      if (error instanceof ValidationError || error instanceof DataError) {
        throw error;
      }
      throw new DataError('Failed to unfollow deck');
    }
  },
  
  // Check if a user is following a specific deck
  async isFollowingDeck(deckId: string): Promise<boolean> {
    try {
      if (!deckId || !isValidUUID(deckId)) {
        return false;
      }
      
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }
      
      const { data, error } = await supabase
        .from('followed_decks')
        .select('id')
        .eq('deck_id', deckId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking follow status:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error in isFollowingDeck:', error);
      return false;
    }
  }
};
