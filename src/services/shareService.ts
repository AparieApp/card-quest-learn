
import { supabase } from "@/integrations/supabase/client";

export const shareService = {
  // Save a share code to the database (accepts a pre-generated code)
  async saveShareCode(deckId: string, code: string): Promise<void> {
    // First check if a share code already exists for this deck
    const { data: existingCode } = await supabase
      .from('share_codes')
      .select('code')
      .eq('deck_id', deckId)
      .single();
    
    if (existingCode) {
      return; // Code already exists
    }
    
    // Save the share code
    const { error } = await supabase
      .from('share_codes')
      .insert({
        code: code,
        deck_id: deckId
      });
      
    if (error) throw error;
  },
  
  // Get deck ID by share code
  async getDeckIdByShareCode(code: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('share_codes')
      .select('deck_id')
      .eq('code', code)
      .single();
      
    if (error) return null;
    
    return data.deck_id;
  }
};
