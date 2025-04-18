
import { useState, useEffect, useRef } from 'react';
import { Deck } from '@/types/deck';
import { deckService } from '@/services/deckService';
import { useAuth } from '@/context/auth';

export const useDeckStorage = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const previousAuthState = useRef<{ isAuthenticated: boolean, userId?: string }>({
    isAuthenticated: false,
    userId: undefined
  });
  
  useEffect(() => {
    // Only fetch decks if auth state meaningfully changed
    const shouldFetchDecks = 
      isAuthenticated !== previousAuthState.current.isAuthenticated || 
      (isAuthenticated && user?.id !== previousAuthState.current.userId);
    
    if (!shouldFetchDecks) return;
    
    const fetchDecks = async () => {
      if (!isAuthenticated || !user) {
        setDecks([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const fetchedDecks = await deckService.getDecks();
        setDecks(fetchedDecks);
      } catch (error) {
        console.error('Error fetching decks:', error);
      } finally {
        setLoading(false);
      }
      
      // Update the previous auth state
      previousAuthState.current = {
        isAuthenticated,
        userId: user?.id
      };
    };

    fetchDecks();
  }, [isAuthenticated, user]);

  return { decks, loading, setDecks };
};
