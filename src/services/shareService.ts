
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validateShareCode, isValidUUID } from '@/utils/secureValidation';
import { ValidationError, DataError } from '@/utils/errorHandling';

export const shareService = {
  // Save a share code to the database (accepts a pre-generated code)
  async saveShareCode(deckId: string, code: string): Promise<void> {
    try {
      // Validate inputs
      if (!isValidUUID(deckId)) {
        throw new ValidationError('Invalid deck ID format');
      }
      
      const validatedCode = validateShareCode(code);
      if (!validatedCode) {
        throw new ValidationError('Invalid share code format');
      }
      
      // First check if a share code already exists for this deck
      const { data: existingCode, error: fetchError } = await supabase
        .from('share_codes')
        .select('code')
        .eq('deck_id', deckId)
        .maybeSingle();
      
      if (fetchError) {
        console.error('Error checking existing share code:', fetchError);
        throw new DataError('Failed to check existing share codes');
      }
      
      if (existingCode) {
        return; // Code already exists
      }
      
      // Save the share code
      const { error } = await supabase
        .from('share_codes')
        .insert({
          code: validatedCode,
          deck_id: deckId
        });
        
      if (error) {
        console.error('Error saving share code:', error);
        throw new DataError('Failed to save share code');
      }
    } catch (error) {
      console.error('ShareService error:', error);
      if (error instanceof ValidationError || error instanceof DataError) {
        throw error;
      }
      throw new DataError('Failed to process share code');
    }
  },
  
  // Get deck ID by share code
  async getDeckIdByShareCode(code: string): Promise<string | null> {
    if (!code) {
      console.error('No share code provided');
      return null;
    }
    
    try {
      // Validate and clean up code before querying
      const validatedCode = validateShareCode(code);
      if (!validatedCode) {
        throw new ValidationError('Invalid share code format');
      }
      
      const { data, error } = await supabase
        .from('share_codes')
        .select('deck_id')
        .eq('code', validatedCode)
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
