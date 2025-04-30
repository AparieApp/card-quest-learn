import { useState, useCallback, useRef } from 'react';
import { shareService } from '@/services/shareService';
import { toast } from 'sonner';
import { deckService } from '@/services/deckService';
import { Deck } from '@/types/deck';

export const useSharing = () => {
  const [generatingCode, setGeneratingCode] = useState(false);
  const shareCodeCache = useRef<Record<string, string>>({});

  const generateShareCode = useCallback((deckId: string): string => {
    if (!deckId) {
      console.error('No deck ID provided');
      return '';
    }
    
    // Check cache first
    if (shareCodeCache.current[deckId]) {
      console.log('Using cached share code for deck:', deckId);
      return shareCodeCache.current[deckId];
    }
    
    // Generate a code that's more readable but still random
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Cache the code immediately
    shareCodeCache.current[deckId] = code;
    
    // Save in background without blocking
    setGeneratingCode(true);
    shareService.saveShareCode(deckId, code)
      .then(() => {
        setGeneratingCode(false);
      })
      .catch((error) => {
        console.error('Error generating share code:', error);
        // Keep using the generated code even if save fails
        // Just notify the user there might be issues with persistence
        toast.error('Failed to save share code');
        setGeneratingCode(false);
      });
    
    return code;
  }, []);

  const getDeckIdByShareCode = useCallback(async (code: string): Promise<string | null> => {
    if (!code) {
      console.error('No share code provided');
      return null;
    }
    
    try {
      // Clean up code before querying
      const cleanCode = code.trim().toUpperCase();
      return await shareService.getDeckIdByShareCode(cleanCode);
    } catch (error) {
      console.error('Error getting deck by share code:', error);
      return null;
    }
  }, []);

  const getDeckByShareCode = useCallback(async (code: string): Promise<Deck | null> => {
    if (!code) {
      console.error('No share code provided');
      toast.error('Invalid share code');
      return null;
    }
    
    try {
      const deckId = await getDeckIdByShareCode(code);
      if (!deckId) {
        toast.error('Deck not found with this share code');
        return null;
      }
      
      return await deckService.getDeck(deckId);
    } catch (error) {
      console.error('Error getting deck by share code:', error);
      toast.error('Failed to load shared deck');
      return null;
    }
  }, [getDeckIdByShareCode]);

  return { 
    generateShareCode, 
    getDeckIdByShareCode, 
    getDeckByShareCode, 
    generatingCode 
  };
};
