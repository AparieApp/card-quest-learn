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
  const isMountedRef = useRef<boolean>(true);
  const networkErrorCountRef = useRef<number>(0);
  
  // Ensure we track if the component is mounted to prevent updates after unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  useEffect(() => {
    // Only fetch decks if auth state meaningfully changed
    const shouldFetchDecks = 
      isAuthenticated !== previousAuthState.current.isAuthenticated || 
      (isAuthenticated && user?.id !== previousAuthState.current.userId);
    
    if (!shouldFetchDecks) return;
    
    const fetchDecks = async () => {
      if (!isAuthenticated || !user) {
        if (isMountedRef.current) {
          setDecks([]);
          setLoading(false);
        }
        return;
      }

      if (isFetchingRef.current) {
        console.log('Fetch already in progress, skipping');
        return;
      }
      
      isFetchingRef.current = true;
      if (isMountedRef.current) {
        setLoading(true);
      }
      
      try {
        console.log('Fetching decks with auth state change');
        const fetchedDecks = await deckService.getDecks();
        
        // Only keep decks created by the current user
        const ownDecks = Array.isArray(fetchedDecks) && user?.id
          ? fetchedDecks.filter(d => d.creator_id === user.id)
          : [];
        
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setDecks(ownDecks);
          console.log('Fetched own decks:', ownDecks.length);
        }
        
        lastFetchTimeRef.current = Date.now();
        networkErrorCountRef.current = 0; // Reset error counter on success
      } catch (error) {
        console.error('Error fetching decks:', error);
        
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          // Increment error counter for exponential backoff
          networkErrorCountRef.current++;
          setDecks([]);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
        isFetchingRef.current = false;
      }
      
      previousAuthState.current = {
        isAuthenticated,
        userId: user?.id
      };
    };

    fetchDecks();
  }, [isAuthenticated, user]);

  // Improved refresh function with better error handling for mobile
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
    // Use exponential backoff on network errors
    const backoffTime = Math.min(500 * Math.pow(2, networkErrorCountRef.current), 10000);
    if (!shouldBypassThrottle && timeSinceLastFetch < backoffTime) {
      console.log(`Throttling refresh - last fetch was only ${timeSinceLastFetch} ms ago, backoff time: ${backoffTime} ms`);
      return null;
    }
    
    console.log(`${shouldBypassThrottle ? 'Bypassing throttle' : 'Normal refresh'} - fetching latest data`);
    
    isFetchingRef.current = true;
    try {
      console.log('Manual refresh of decks requested');
      const fetchedDecks = await deckService.getDecks();
      console.log('Manual refresh retrieved', fetchedDecks.length, 'decks');
      
      // Filter to only the current user's decks
      const ownDecks = Array.isArray(fetchedDecks) && user?.id
        ? fetchedDecks.filter(d => d.creator_id === user.id)
        : [];
      
      // Always update the state when we get fresh data, but only if component is mounted
      if (isMountedRef.current) {
        setDecks(ownDecks);
        console.log('Manual refresh own decks:', ownDecks.length);
      }
      
      lastFetchTimeRef.current = now;
      networkErrorCountRef.current = 0; // Reset error counter on success
      return fetchedDecks;
    } catch (error) {
      console.error('Error during manual refresh:', error);
      
      // Increment error counter for exponential backoff
      networkErrorCountRef.current++;
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
      if (!isMountedRef.current) return;
      
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
