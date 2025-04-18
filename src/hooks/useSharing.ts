
import { useState, useEffect } from 'react';
import { shareService } from '@/services/shareService';

export const useSharing = () => {
  const [shareCodes, setShareCodes] = useState<Record<string, string>>({});

  useEffect(() => {
    const storedShareCodes = localStorage.getItem('flashcard_share_codes');
    if (storedShareCodes) {
      setShareCodes(JSON.parse(storedShareCodes));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('flashcard_share_codes', JSON.stringify(shareCodes));
  }, [shareCodes]);

  const generateShareCode = (deckId: string): string => {
    const existingCode = Object.entries(shareCodes).find(([_, id]) => id === deckId)?.[0];
    if (existingCode) return existingCode;
    
    const code = shareService.generateShareCode();
    setShareCodes(prev => ({ ...prev, [code]: deckId }));
    return code;
  };

  const getDeckByShareCode = (code: string): string | undefined => {
    return shareCodes[code];
  };

  return { generateShareCode, getDeckByShareCode };
};
