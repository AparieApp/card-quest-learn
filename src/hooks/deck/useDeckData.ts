
import { useState, useCallback, useEffect } from 'react';
import { Deck } from '@/types/deck';
import { useDeck } from '@/context/DeckContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useDeckData = (deckId: string) => {
  const { getDeck, refreshDecks } = useDeck();
  const [fetchedDeck, setFetchedDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const navigate = useNavigate();

  const throttledRefresh = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTime;
    
    if (timeSinceLastRefresh < 3000) {
      console.log('Throttling refresh, last refresh was', timeSinceLastRefresh, 'ms ago');
      return;
    }
    
    console.log('Executing throttled refresh');
    setLastRefreshTime(now);
    
    try {
      await refreshDecks();
      const updatedDeck = getDeck(deckId);
      if (updatedDeck) {
        console.log('Updated deck data received:', updatedDeck.cards.length, 'cards');
        setFetchedDeck(updatedDeck);
      }
    } catch (error) {
      console.error('Error during throttled refresh:', error);
    }
  }, [deckId, refreshDecks, getDeck, lastRefreshTime]);

  const loadDeckData = useCallback(async () => {
    if (!loading && fetchedDeck) {
      return;
    }
    
    setLoading(true);
    try {
      let deck = getDeck(deckId);
      
      if (!deck) {
        await refreshDecks();
        deck = getDeck(deckId);
      }
      
      if (!deck) {
        toast.error('Deck not found');
        navigate('/dashboard');
        return;
      }
      
      setFetchedDeck(deck);
      setLastRefreshTime(Date.now());
    } catch (error) {
      console.error('Error loading deck:', error);
      toast.error('Error loading deck');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [deckId, getDeck, navigate, refreshDecks, loading, fetchedDeck]);

  useEffect(() => {
    loadDeckData();
  }, [loadDeckData]);

  return {
    fetchedDeck,
    loading,
    lastRefreshTime,
    throttledRefresh
  };
};
