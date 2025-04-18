
import { useState } from 'react';
import { shareService } from '@/services/shareService';
import { toast } from 'sonner';

export const useSharing = () => {
  const [generatingCode, setGeneratingCode] = useState(false);

  const generateShareCode = async (deckId: string): Promise<string> => {
    setGeneratingCode(true);
    try {
      const code = await shareService.saveShareCode(deckId);
      return code;
    } catch (error) {
      console.error('Error generating share code:', error);
      toast.error('Failed to generate share code');
      throw error;
    } finally {
      setGeneratingCode(false);
    }
  };

  const getDeckByShareCode = async (code: string): Promise<string | null> => {
    try {
      return await shareService.getDeckIdByShareCode(code);
    } catch (error) {
      console.error('Error getting deck by share code:', error);
      return null;
    }
  };

  return { generateShareCode, getDeckByShareCode, generatingCode };
};
