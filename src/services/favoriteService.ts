
import { supabase } from "@/integrations/supabase/client";

export const favoriteService = {
  // Add a deck to favorites
  async addFavorite(userId: string, deckId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        deck_id: deckId
      });
      
    if (error) throw error;
  },

  // Remove a deck from favorites
  async removeFavorite(userId: string, deckId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('deck_id', deckId);
      
    if (error) throw error;
  },

  // Check if a deck is in favorites
  async isFavorite(userId: string, deckId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('deck_id', deckId)
      .single();
      
    return !!data && !error;
  },
  
  // Get all favorite deck IDs for a user
  async getFavorites(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('deck_id')
      .eq('user_id', userId);
      
    if (error) return [];
    
    return data.map(item => item.deck_id);
  }
};
