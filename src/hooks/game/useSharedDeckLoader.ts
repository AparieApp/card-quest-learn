
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
  
  // Get deck function with stable reference
  const fetchDeckByShareCode = useCallback((code: string) => {
    return getDeckByShareCode(code);
  }, [getDeckByShareCode]);

  // Memoized loader function with fixed dependencies
  const loadSharedDeck = useCallback(() => {
    if (!shareCode) {
      toast.error('Share code is missing');
      navigate('/');
      return Promise.resolve(null);
    }
    
    // Prevent concurrent loading attempts
    if (isLoadingRef.current) {
      console.log('Already loading shared deck, skipping duplicate request');
      return Promise.resolve(null);
    }
    
    // If we've already loaded this deck successfully, avoid reloading
    if (hasLoadedRef.current) {
      console.log('Deck already loaded, skipping reload');
      return Promise.resolve(null);
    }
    
    isLoadingRef.current = true;
    setState(prev => ({ ...prev, isLoading: true }));
    
    return new Promise(async (resolve) => {
      try {
        // Use circuit breaker to prevent infinite loading loops
        const fetchedDeck = await withCircuitBreaker(
          () => fetchDeckByShareCode(shareCode),
          `load-shared-deck-${shareCode}`,
          { failureThreshold: 2, resetTimeout: 30000 }
        );
        
        if (!fetchedDeck) {
          console.error('Shared deck not found for code:', shareCode);
          toast.error('Shared deck not found');
          navigate('/');
          resolve(null);
          return;
        }
        
        if (!fetchedDeck.cards || fetchedDeck.cards.length === 0) {
          toast.warning('This deck has no cards');
          navigate(`/shared/${shareCode}`);
          resolve(null);
          return;
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
        
        resolve(fetchedDeck);
      } catch (error) {
        handleGameError(error, 'load shared deck');
        setState(prev => ({ ...prev, isLoading: false }));
        
        // Navigate back after error
        setTimeout(() => {
          navigate('/');
        }, 2000);
        
        resolve(null);
      } finally {
        isLoadingRef.current = false;
      }
    });
  }, [shareCode, fetchDeckByShareCode, navigate, setState, handleGameError]);

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
