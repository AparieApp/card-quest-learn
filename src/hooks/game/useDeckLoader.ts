
import { useEffect } from 'react';
import { useDeck } from '@/context/DeckContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useDeckLoader = (deckId: string | undefined, setState: Function) => {
  const navigate = useNavigate();
  const { getDeck, refreshDecks } = useDeck();

  useEffect(() => {
    if (!deckId) {
      navigate('/dashboard');
      return;
    }
    
    const loadDeck = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      try {
        await refreshDecks();
        const fetchedDeck = getDeck(deckId);
        if (!fetchedDeck || fetchedDeck.cards.length === 0) {
          toast.error('Deck not found or has no cards');
          navigate('/dashboard');
          return;
        }
        
        const shuffledCards = [...fetchedDeck.cards].sort(() => Math.random() - 0.5);
        
        setState(prev => ({
          ...prev,
          deck: fetchedDeck,
          cards: shuffledCards,
          isLoading: false,
        }));
      } catch (error) {
        console.error('Error loading deck:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    loadDeck();
  }, [deckId, getDeck, navigate, refreshDecks, setState]);
};
