
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
  const bypassThrottleRef = useRef<boolean>(false);
  
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
        setDecks([]);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
      
      previousAuthState.current = {
        isAuthenticated,
        userId: user?.id
      };
    };

    fetchDecks();
  }, [isAuthenticated, user]);

  const refreshDecksWithThrottle = async (bypassThrottle = false) => {
    if (!isAuthenticated || !user) {
      console.log('Cannot refresh decks: Not authenticated');
      return null;
    }
    
    if (isFetchingRef.current) {
      console.log('Refresh already in progress, skipping');
      return null;
    }
    
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    const shouldBypassThrottle = bypassThrottle || bypassThrottleRef.current;
    
    // Always allow refresh if bypassing throttle or if enough time has passed
    if (!shouldBypassThrottle && timeSinceLastFetch < 500) {
      console.log('Throttling refresh - last fetch was only', timeSinceLastFetch, 'ms ago');
      return null;
    }
    
    console.log(`${shouldBypassThrottle ? 'Bypassing throttle' : 'Normal refresh'} - fetching latest data`);
    
    isFetchingRef.current = true;
    try {
      console.log('Manual refresh of decks requested');
      const fetchedDecks = await deckService.getDecks();
      console.log('Manual refresh retrieved', fetchedDecks.length, 'decks');
      
      // Always update the state when we get fresh data
      setDecks(Array.isArray(fetchedDecks) ? fetchedDecks : []);
      lastFetchTimeRef.current = now;
      return fetchedDecks;
    } catch (error) {
      console.error('Error during manual refresh:', error);
      return null;
    } finally {
      isFetchingRef.current = false;
    }
  };

  // Add function to set bypass throttle
  const setBypassThrottle = (value: boolean) => {
    console.log(`${value ? 'Enabling' : 'Disabling'} throttle bypass`);
    bypassThrottleRef.current = value;
  };

  return { 
    decks, 
    loading,
    refreshDecks: refreshDecksWithThrottle,
    setDecks: (newDecks: Deck[] | ((prev: Deck[]) => Deck[])) => {
      if (typeof newDecks === 'function') {
        setDecks(prev => {
          const result = newDecks(prev);
          // Mark the time of this update to avoid unnecessary refreshes
          if (result !== prev) {
            lastFetchTimeRef.current = Date.now();
          }
          return Array.isArray(result) ? result : [];
        });
      } else {
        setDecks(Array.isArray(newDecks) ? newDecks : []);
        // Mark the time of this update
        lastFetchTimeRef.current = Date.now();
      }
    },
    setBypassThrottle
  };
};
