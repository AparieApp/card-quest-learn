
import { supabase } from "@/integrations/supabase/client";

export const shareService = {
  // Generate a random share code
  generateShareCode: (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  },
  
  // Save a share code to the database
  async saveShareCode(deckId: string): Promise<string> {
    // First check if a share code already exists for this deck
    const { data: existingCode } = await supabase
      .from('share_codes')
      .select('code')
      .eq('deck_id', deckId)
      .single();
    
    if (existingCode) {
      return existingCode.code;
    }
    
    // Generate a new share code
    const code = shareService.generateShareCode();
    
    // Save the share code
    const { error } = await supabase
      .from('share_codes')
      .insert({
        code: code,
        deck_id: deckId
      });
      
    if (error) throw error;
    
    return code;
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
