
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
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
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
        .single();
        
      if (error) {
        console.error('Error fetching deck by share code:', error);
        return null;
      }
      
      if (!data || !data.deck_id) {
        console.log('No deck found with share code:', code);
        return null;
      }
      
      return data.deck_id;
    } catch (error) {
      console.error('Error in getDeckIdByShareCode:', error);
      return null;
    }
  }
};
