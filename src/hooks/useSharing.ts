
import { useState } from 'react';
import { shareService } from '@/services/shareService';
import { toast } from 'sonner';
import { deckService } from '@/services/deckService';
import { Deck } from '@/types/deck';

export const useSharing = () => {
  const [generatingCode, setGeneratingCode] = useState(false);

  const generateShareCode = (deckId: string): string => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    setGeneratingCode(true);
    shareService.saveShareCode(deckId, code)
      .then(() => {
        setGeneratingCode(false);
      })
      .catch((error) => {
        console.error('Error generating share code:', error);
        toast.error('Failed to save share code');
        setGeneratingCode(false);
      });
    
    return code;
  };

  const getDeckIdByShareCode = async (code: string): Promise<string | null> => {
    try {
      return await shareService.getDeckIdByShareCode(code);
    } catch (error) {
      console.error('Error getting deck by share code:', error);
      return null;
    }
  };

  const getDeckByShareCode = async (code: string): Promise<Deck | null> => {
    try {
      const deckId = await getDeckIdByShareCode(code);
      if (!deckId) return null;
      return await deckService.getDeck(deckId);
    } catch (error) {
      console.error('Error getting deck by share code:', error);
      return null;
    }
  };

  return { generateShareCode, getDeckIdByShareCode, getDeckByShareCode, generatingCode };
};
