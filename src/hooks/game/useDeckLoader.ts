
import { useEffect, useCallback } from 'react';
import { useDeck } from '@/context/DeckContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useGameError } from './useGameError';

export const useDeckLoader = (deckId: string | undefined, setState: Function) => {
  const navigate = useNavigate();
  const { getDeck, refreshDecks } = useDeck();
  const { handleGameError } = useGameError();
  
  // Memoized loader function to prevent unnecessary re-renders
  const loadDeck = useCallback(async () => {
    if (!deckId) return null;
    
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await refreshDecks();
      const fetchedDeck = getDeck(deckId);
      
      if (!fetchedDeck) {
        toast.error('Deck not found');
        navigate('/dashboard');
        return null;
      }
      
      if (fetchedDeck.cards.length === 0) {
        toast.warning('This deck has no cards');
        navigate(`/deck/${deckId}`);
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
      handleGameError(error, 'load deck');
      setState(prev => ({ ...prev, isLoading: false }));
      return null;
    }
  }, [deckId, getDeck, navigate, refreshDecks, setState, handleGameError]);

  // Effect to load deck on mount or when deckId changes
  useEffect(() => {
    if (!deckId) {
      navigate('/dashboard');
      return;
    }
    
    loadDeck();
  }, [deckId, loadDeck, navigate]);
  
  return { loadDeck };
};
