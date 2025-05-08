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
    if (isMountedRef.current) { // Ensure component is mounted for any state updates
      if (isAuthenticated && user?.id) {
        const authActuallyChanged = previousAuthState.current.isAuthenticated !== isAuthenticated;
        const userActuallyChanged = previousAuthState.current.userId !== user.id;

        // Fetch if:
        // 1. User just logged in (isAuthenticated changed from false to true)
        // 2. The user.id itself has changed (e.g. different user, or first time ID is available)
        if (authActuallyChanged || userActuallyChanged) {
          console.log('Auth or user ID change detected, fetching user decks.', { authActuallyChanged, userActuallyChanged, userId: user.id });
          // fetchUserDecks manages its own loading state (setLoading, isFetchingRef)
          const fetchUserDecks = async () => {
            if (!isMountedRef.current || !user?.id || !isAuthenticated) { // Re-check critical conditions
              if(isMountedRef.current) {
                if (!isAuthenticated || !user?.id) setDecks([]);
                setLoading(false);
              }
              return;
            }
            if (isFetchingRef.current) {
              console.log('Fetch already in progress, skipping for new user/auth change trigger.');
              return;
            }
            isFetchingRef.current = true;
            setLoading(true);
            try {
              console.log('Fetching all decks to filter for user:', user.id);
              const fetchedDecks = await deckService.getDecks();
              if (!isMountedRef.current || !user?.id || !isAuthenticated) { // Re-check after await
                if (isMountedRef.current) {
                  if (!isAuthenticated || !user?.id) setDecks([]);
                  setLoading(false);
                }
                isFetchingRef.current = false;
                return;
              }
              const ownDecks = Array.isArray(fetchedDecks)
                ? fetchedDecks.filter(d => d.creator_id === user.id)
                : [];
              if (isMountedRef.current) {
                setDecks(ownDecks);
                console.log('Fetched own decks:', ownDecks.length);
              }
              lastFetchTimeRef.current = Date.now();
              networkErrorCountRef.current = 0;
            } catch (error) {
              console.error('Error fetching or filtering user decks:', error);
              if (isMountedRef.current) {
                networkErrorCountRef.current++;
                setDecks([]);
              }
            } finally {
              if (isMountedRef.current) {
                setLoading(false);
              }
              isFetchingRef.current = false;
            }
          };
          fetchUserDecks();
        }
        // No automatic re-fetch if decks remain empty after the initial fetch for this user.
        // Manual refresh is handled by refreshDecksWithThrottle.

      } else { // Not authenticated or user.id is missing
        // This handles logout or if auth is lost
        if (previousAuthState.current.isAuthenticated && !isAuthenticated) {
          console.log('User logged out or auth lost. Clearing decks and stopping loading.');
          if (decks.length > 0) {
            setDecks([]);
          }
        }
        // Ensure loading and fetching flags are false if not authenticated
        if (loading) {
          setLoading(false);
        }
        if (isFetchingRef.current) {
          isFetchingRef.current = false;
        }
      }
      // Update previous state *after* all logic for the current render, using current values
      previousAuthState.current = { isAuthenticated, userId: user?.id };
    }
  }, [isAuthenticated, user]); // Effect runs if isAuthenticated or user object reference changes.

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
