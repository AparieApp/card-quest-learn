
import { useState } from 'react';
import { shareService } from '@/services/shareService';
import { toast } from 'sonner';

export const useSharing = () => {
  const [generatingCode, setGeneratingCode] = useState(false);

  // This function generates a share code and stores it in the database asynchronously
  const generateShareCode = (deckId: string): string => {
    // Generate a client-side code immediately
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Save it to the database in the background
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

  return { generateShareCode, getDeckIdByShareCode, generatingCode };
};
