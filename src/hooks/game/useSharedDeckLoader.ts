
import { useEffect, useCallback } from 'react';
import { useSharing } from '@/hooks/useSharing';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useGameError } from './useGameError';

export const useSharedDeckLoader = (shareCode: string | undefined, setState: Function) => {
  const navigate = useNavigate();
  const { getDeckByShareCode } = useSharing();
  const { handleGameError } = useGameError();
  
  // Memoized loader function to prevent unnecessary re-renders
  const loadSharedDeck = useCallback(async () => {
    if (!shareCode) return null;
    
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const fetchedDeck = await getDeckByShareCode(shareCode);
      
      if (!fetchedDeck) {
        toast.error('Shared deck not found');
        navigate('/');
        return null;
      }
      
      if (fetchedDeck.cards.length === 0) {
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
      
      return fetchedDeck;
    } catch (error) {
      handleGameError(error, 'load shared deck');
      setState(prev => ({ ...prev, isLoading: false }));
      return null;
    }
  }, [shareCode, getDeckByShareCode, navigate, setState, handleGameError]);

  // Effect to load deck on mount or when shareCode changes
  useEffect(() => {
    if (!shareCode) {
      navigate('/');
      return;
    }
    
    loadSharedDeck();
  }, [shareCode, loadSharedDeck, navigate]);
  
  return { loadSharedDeck };
};
