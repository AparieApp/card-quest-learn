import { useState, useRef } from 'react';
import { Deck } from '@/types/deck';
import { deckService } from '@/services/deckService';
import { useSharing } from '@/hooks/useSharing';
import { toast } from 'sonner';

export const useSharingOperations = (
  decks: Deck[],
  setDecks: React.Dispatch<React.SetStateAction<Deck[]>>,
  userId?: string
) => {
  // Use useRef for caching to maintain values between renders without triggering re-renders
  const shareCodeCacheRef = useRef<Record<string, string>>({});
  const { generateShareCode: genShareCode, getDeckIdByShareCode: getSharedDeckId } = useSharing();
  const [isLoadingShareCode, setIsLoadingShareCode] = useState(false);

  const getDeckByShareCode = async (code: string): Promise<Deck | null> => {
    try {
      if (!code) {
        toast.error('Invalid share code');
        return null;
      }
      
      const deckId = await getSharedDeckId(code);
      if (!deckId) {
        toast.error('Invalid share code or deck not found');
        return null;
      }
      
      // Check local cache first to avoid unnecessary API calls
      const cachedDeck = decks.find(d => d.id === deckId);
      if (cachedDeck) {
        console.log('Using cached deck from memory');
        return cachedDeck;
      }
      
      // Otherwise fetch from API
      console.log('Fetching deck from API with ID:', deckId);
      const deck = await deckService.getDeck(deckId);
      
      if (!deck) {
        toast.error('Deck not found');
        return null;
      }
      
      return deck;
    } catch (error) {
      console.error('Error getting deck by share code:', error);
      toast.error('Error loading shared deck');
      return null;
    }
  };

  const generateShareCode = (deckId: string): string => {
    if (!userId) {
      console.error('User not authenticated when generating share code');
      return '';
    }
    
    // Check for existing share code in cache first
    if (shareCodeCacheRef.current[deckId]) {
      console.log('Using cached share code for deck:', deckId);
      return shareCodeCacheRef.current[deckId];
    }
    
    setIsLoadingShareCode(true);
    
    try {
      const code = genShareCode(deckId);
      if (!code) {
        toast.error('Failed to generate share code');
        return '';
      }
      
      // Cache the code
      shareCodeCacheRef.current[deckId] = code;
      setIsLoadingShareCode(false);
      return code;
    } catch (error) {
      console.error('Error generating share code:', error);
      setIsLoadingShareCode(false);
      toast.error('Failed to generate share code');
      return '';
    }
  };

  const copyDeck = async (deckId: string): Promise<Deck> => {
    if (!userId) throw new Error('User not authenticated');
    
    const copiedDeck = await deckService.copyDeck(userId, deckId);
    setDecks(prev => [copiedDeck, ...prev]);
    return copiedDeck;
  };

  return {
    getDeckByShareCode,
    generateShareCode,
    copyDeck,
    isLoadingShareCode,
  };
};
