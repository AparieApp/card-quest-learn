import { supabase } from "@/integrations/supabase/client";
import { Deck } from "@/types/deck";

/**
 * Service for handling followed decks operations
 */
export const followedDeckService = {
  /**
   * Get the share code for a followed deck
   */
  async getShareCodeForDeck(deckId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('share_codes')
        .select('code')
        .eq('deck_id', deckId)
        .single();
        
      if (error) throw error;
      
      return data?.code || null;
    } catch (error) {
      console.error('Error getting share code for deck:', error);
      return null;
    }
  },

  /**
   * Get all followed decks for a user with their details
   */
  async getFollowedDecksWithDetails(userId: string): Promise<Deck[]> {
    try {
      // Get followed deck IDs
      const { data: followedData, error: followedError } = await supabase
        .from('followed_decks')
        .select('deck_id')
        .eq('user_id', userId);
        
      if (followedError) throw followedError;
      if (!followedData || followedData.length === 0) return [];
      
      // Extract deck IDs
      const deckIds = followedData.map(item => item.deck_id);
      
      // Get deck details
      const { data: decksData, error: decksError } = await supabase
        .from('decks')
        .select(`
          *,
          flashcards(*)
        `)
        .in('id', deckIds);
        
      if (decksError) throw decksError;
      if (!decksData) return [];
      
      // Transform the data to match the Deck interface
      return decksData.map((deck: any) => ({
        ...deck,
        cards: deck.flashcards || [],
      }));
    } catch (error) {
      console.error('Error getting followed decks with details:', error);
      return [];
    }
  },

  /**
   * Follow a deck
   */
  async followDeck(userId: string, deckId: string): Promise<boolean> {
    try {
      // Check if already following
      const { data: existingFollow, error: checkError } = await supabase
        .from('followed_decks')
        .select('id')
        .eq('user_id', userId)
        .eq('deck_id', deckId)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      // If already following, return success
      if (existingFollow) return true;
      
      // Add to followed_decks
      const { error } = await supabase
        .from('followed_decks')
        .insert({
          user_id: userId,
          deck_id: deckId,
        });
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error following deck:', error);
      return false;
    }
  },

  /**
   * Unfollow a deck
   */
  async unfollowDeck(userId: string, deckId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('followed_decks')
        .delete()
        .eq('user_id', userId)
        .eq('deck_id', deckId);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error unfollowing deck:', error);
      return false;
    }
  }
}; 