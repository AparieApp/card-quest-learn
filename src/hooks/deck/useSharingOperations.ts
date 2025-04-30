
import { useState, useRef } from 'react';
import { Deck } from '@/types/deck';
import { deckService } from '@/services/deckService';
import { useSharing } from '@/hooks/useSharing';

export const useSharingOperations = (
  decks: Deck[],
  setDecks: React.Dispatch<React.SetStateAction<Deck[]>>,
  userId?: string
) => {
  // Use useRef for caching to maintain values between renders without triggering re-renders
  const shareCodeCacheRef = useRef<Record<string, string>>({});
  const { generateShareCode: genShareCode, getDeckIdByShareCode: getSharedDeckId } = useSharing();

  const getDeckByShareCode = async (code: string): Promise<Deck | null> => {
    try {
      const deckId = await getSharedDeckId(code);
      if (!deckId) return null;
      
      const cachedDeck = decks.find(d => d.id === deckId);
      if (cachedDeck) return cachedDeck;
      
      const deck = await deckService.getDeck(deckId);
      return deck;
    } catch (error) {
      console.error('Error getting deck by share code:', error);
      return null;
    }
  };

  const generateShareCode = (deckId: string): string => {
    if (!userId) {
      console.error('User not authenticated when generating share code');
      return '';
    }
    
    if (shareCodeCacheRef.current[deckId]) {
      return shareCodeCacheRef.current[deckId];
    }
    
    const code = genShareCode(deckId);
    shareCodeCacheRef.current[deckId] = code;
    return code;
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
  };
};
