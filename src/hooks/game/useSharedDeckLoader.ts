
import { useEffect, useCallback, useRef } from 'react';
import { useSharing } from '@/hooks/useSharing';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useGameError } from './useGameError';
import { withCircuitBreaker } from '@/utils/circuitBreaker';

export const useSharedDeckLoader = (shareCode: string | undefined, setState: Function) => {
  const navigate = useNavigate();
  const { getDeckByShareCode } = useSharing();
  const { handleGameError } = useGameError();
  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false);
  
  // Memoized loader function with proper dependency array
  const loadSharedDeck = useCallback(async () => {
    if (!shareCode) {
      toast.error('Share code is missing');
      navigate('/');
      return null;
    }
    
    // Prevent concurrent loading attempts
    if (isLoadingRef.current) {
      console.log('Already loading shared deck, skipping duplicate request');
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
      const fetchedDeck = await withCircuitBreaker(
        () => getDeckByShareCode(shareCode),
        `load-shared-deck-${shareCode}`,
        { failureThreshold: 2, resetTimeout: 30000 }
      );
      
      if (!fetchedDeck) {
        console.error('Shared deck not found for code:', shareCode);
        toast.error('Shared deck not found');
        navigate('/');
        return null;
      }
      
      if (!fetchedDeck.cards || fetchedDeck.cards.length === 0) {
        toast.warning('This deck has no cards');
        navigate(`/shared/${shareCode}`);
        return null;
      }
      
      // Shuffle cards efficiently using Fisher-Yates algorithm
      const shuffledCards = [...fetchedDeck.cards];
      for (let i = shuffledCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
      }
      
      setState(prev => ({
        ...prev,
        deck: fetchedDeck,
        cards: shuffledCards,
        isLoading: false,
      }));
      
      // Mark that we've successfully loaded the deck
      hasLoadedRef.current = true;
      
      return fetchedDeck;
    } catch (error) {
      handleGameError(error, 'load shared deck');
      setState(prev => ({ ...prev, isLoading: false }));
      
      // Navigate back after error
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
      return null;
    } finally {
      isLoadingRef.current = false;
    }
  }, [shareCode, getDeckByShareCode, navigate, setState, handleGameError]);

  // Effect to load deck on mount or when shareCode changes
  useEffect(() => {
    if (!shareCode) {
      navigate('/');
      return;
    }
    
    // Reset the loaded state when share code changes
    if (shareCode) {
      hasLoadedRef.current = false;
    }
    
    loadSharedDeck();
    
    // Cleanup function
    return () => {
      hasLoadedRef.current = false;
    };
  }, [shareCode, navigate, loadSharedDeck]);
  
  return { loadSharedDeck };
};
