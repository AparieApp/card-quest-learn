
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
  const lastFetchTimeRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);
  
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

      // Prevent concurrent fetches
      if (isFetchingRef.current) {
        console.log('Fetch already in progress, skipping');
        return;
      }
      
      isFetchingRef.current = true;
      setLoading(true);
      try {
        console.log('Fetching decks with auth state change');
        const fetchedDecks = await deckService.getDecks();
        setDecks(Array.isArray(fetchedDecks) ? fetchedDecks : []);
        console.log('Fetched decks:', fetchedDecks.length);
        lastFetchTimeRef.current = Date.now();
      } catch (error) {
        console.error('Error fetching decks:', error);
        setDecks([]); // Reset to empty array on error
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
      
      // Update the previous auth state
      previousAuthState.current = {
        isAuthenticated,
        userId: user?.id
      };
    };

    fetchDecks();
  }, [isAuthenticated, user]);

  const refreshDecksWithThrottle = async () => {
    if (!isAuthenticated || !user) {
      console.log('Cannot refresh decks: Not authenticated');
      return;
    }
    
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      console.log('Refresh already in progress, skipping');
      return;
    }
    
    // Reduce throttling from 2000ms to 500ms to make refreshes more responsive
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    if (timeSinceLastFetch < 500) {
      console.log('Throttling refresh - last fetch was only', timeSinceLastFetch, 'ms ago');
      return;
    }
    
    isFetchingRef.current = true;
    try {
      console.log('Manual refresh of decks requested');
      const fetchedDecks = await deckService.getDecks();
      console.log('Manual refresh retrieved', fetchedDecks.length, 'decks');
      setDecks(Array.isArray(fetchedDecks) ? fetchedDecks : []);
      lastFetchTimeRef.current = Date.now();
      return fetchedDecks;
    } catch (error) {
      console.error('Error during manual refresh:', error);
      return null;
    } finally {
      isFetchingRef.current = false;
    }
  };

  return { 
    decks, 
    loading,
    refreshDecks: refreshDecksWithThrottle,
    setDecks: (newDecks: Deck[] | ((prev: Deck[]) => Deck[])) => {
      if (typeof newDecks === 'function') {
        setDecks(prev => {
          const result = newDecks(prev);
          return Array.isArray(result) ? result : [];
        });
      } else {
        setDecks(Array.isArray(newDecks) ? newDecks : []);
      }
    }
  };
};
