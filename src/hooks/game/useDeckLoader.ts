
import { useEffect, useCallback, useRef } from 'react';
import { useDeck } from '@/context/DeckContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useGameError } from './useGameError';
import { withCircuitBreaker } from '@/utils/circuitBreaker';

export const useDeckLoader = (deckId: string | undefined, setState: Function) => {
  const navigate = useNavigate();
  const { getDeck, refreshDecks, setThrottlingPaused } = useDeck();
  const { handleGameError } = useGameError();
  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const attemptCountRef = useRef(0);
  
  // Memoized loader function with stable dependencies
  const loadDeck = useCallback(async () => {
    if (!deckId) {
      console.log('No deck ID provided, navigating to dashboard');
      navigate('/dashboard');
      return null;
    }
    
    // Prevent concurrent loading attempts
    if (isLoadingRef.current) {
      console.log('Already loading deck, skipping duplicate request');
      return null;
    }
    
    // If we've already loaded this deck successfully, avoid reloading
    if (hasLoadedRef.current) {
      console.log('Deck already loaded, skipping reload');
      return null;
    }
    
    // Track loading state
    isLoadingRef.current = true;
    setState(prev => ({ ...prev, isLoading: true }));
    
    // Temporarily pause throttling for this critical operation
    setThrottlingPaused(true);
    
    try {
      attemptCountRef.current += 1;
      console.log(`Loading deck ${deckId}, attempt #${attemptCountRef.current}`);
      
      // Use circuit breaker to prevent infinite loading loops
      const result = await withCircuitBreaker(
        async () => {
          // Ensure we get fresh data by bypassing throttling
          await refreshDecks(true); 
          
          // Small delay to ensure the refresh has completed
          if (attemptCountRef.current > 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          const fetchedDeck = getDeck(deckId);
          
          if (!fetchedDeck) {
            console.error('Deck not found after refresh:', deckId);
            toast.error('Deck not found');
            navigate('/dashboard');
            return null;
          }
          
          if (!fetchedDeck.cards || fetchedDeck.cards.length === 0) {
            console.warn('Deck has no cards:', deckId);
            toast.warning('This deck has no cards');
            navigate(`/deck/${deckId}`);
            return null;
          }
          
          return fetchedDeck;
        },
        `load-deck-${deckId}`,
        { failureThreshold: 3, resetTimeout: 30000 }
      );
      
      if (result) {
        // Shuffle cards efficiently using Fisher-Yates algorithm
        const shuffledCards = [...result.cards];
        for (let i = shuffledCards.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
        }
        
        setState(prev => ({
          ...prev,
          deck: result,
          cards: shuffledCards,
          isLoading: false,
        }));
        
        console.log(`Successfully loaded deck ${deckId} with ${shuffledCards.length} cards`);
        
        // Mark that we've successfully loaded the deck
        hasLoadedRef.current = true;
        attemptCountRef.current = 0;
        return result;
      }
      
      return null;
    } catch (error) {
      handleGameError(error, 'load deck');
      setState(prev => ({ ...prev, isLoading: false }));
      return null;
    } finally {
      isLoadingRef.current = false;
      // Re-enable normal throttling
      setThrottlingPaused(false);
    }
  }, [deckId, getDeck, navigate, refreshDecks, setState, handleGameError, setThrottlingPaused]);

  // Effect to load deck on mount or when deckId changes
  useEffect(() => {
    if (!deckId) {
      navigate('/dashboard');
      return;
    }
    
    // Reset the loaded state when deck ID changes
    hasLoadedRef.current = false;
    attemptCountRef.current = 0;
    
    // Execute the load operation
    const loadPromise = loadDeck();
    
    // If loading fails after 3 seconds, try one more time
    const timeoutId = setTimeout(() => {
      if (!hasLoadedRef.current && !isLoadingRef.current) {
        console.log('Deck loading timed out, retrying...');
        loadDeck();
      }
    }, 3000);
    
    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      hasLoadedRef.current = false;
    };
  }, [deckId, navigate, loadDeck]);
  
  return { loadDeck };
};
