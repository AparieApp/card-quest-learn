
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const shareService = {
  // Save a share code to the database (accepts a pre-generated code)
  async saveShareCode(deckId: string, code: string): Promise<void> {
    try {
      // First check if a share code already exists for this deck
      const { data: existingCode, error: fetchError } = await supabase
        .from('share_codes')
        .select('code')
        .eq('deck_id', deckId)
        .maybeSingle();
      
      if (fetchError) {
        console.error('Error checking existing share code:', fetchError);
        throw fetchError;
      }
      
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
        
      if (error) {
        console.error('Error saving share code:', error);
        throw error;
      }
    } catch (error) {
      console.error('ShareService error:', error);
      throw error;
    }
  },
  
  // Get deck ID by share code
  async getDeckIdByShareCode(code: string): Promise<string | null> {
    if (!code) {
      console.error('No share code provided');
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('share_codes')
        .select('deck_id')
        .eq('code', code.trim().toUpperCase())
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching deck by share code:', error);
        return null;
      }
      
      return data?.deck_id || null;
    } catch (error) {
      console.error('Error in getDeckIdByShareCode:', error);
      return null;
    }
  }
};
