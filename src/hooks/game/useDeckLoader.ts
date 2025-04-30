
import { useEffect, useCallback, useRef } from 'react';
import { useDeck } from '@/context/DeckContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useGameError } from './useGameError';
import { withCircuitBreaker } from '@/utils/circuitBreaker';

export const useDeckLoader = (deckId: string | undefined, setState: Function) => {
  const navigate = useNavigate();
  const { getDeck, refreshDecks } = useDeck();
  const { handleGameError } = useGameError();
  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false);
  
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
    
    isLoadingRef.current = true;
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Use circuit breaker to prevent infinite loading loops
      const result = await withCircuitBreaker(
        async () => {
          await refreshDecks(true); // Force refresh with throttle bypass
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
        { failureThreshold: 2, resetTimeout: 30000 }
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
        
        // Mark that we've successfully loaded the deck
        hasLoadedRef.current = true;
      }
      
      return result;
    } catch (error) {
      handleGameError(error, 'load deck');
      setState(prev => ({ ...prev, isLoading: false }));
      return null;
    } finally {
      isLoadingRef.current = false;
    }
  }, [deckId, getDeck, navigate, refreshDecks, setState, handleGameError]);

  // Effect to load deck on mount or when deckId changes
  useEffect(() => {
    if (!deckId) {
      navigate('/dashboard');
      return;
    }
    
    // Reset the loaded state when deck ID changes
    if (deckId) {
      hasLoadedRef.current = false;
    }
    
    loadDeck();
    
    // Cleanup function
    return () => {
      hasLoadedRef.current = false;
    };
  }, [deckId, navigate, loadDeck]);
  
  return { loadDeck };
};
