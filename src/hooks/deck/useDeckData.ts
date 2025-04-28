
import { useState, useCallback, useEffect, useRef } from 'react';
import { Deck } from '@/types/deck';
import { useDeck } from '@/context/DeckContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useDeckData = (deckId: string, enableAutoRefresh: boolean = false, updateTrigger: number = 0) => {
  const { getDeck, refreshDecks } = useDeck();
  const [fetchedDeck, setFetchedDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const lastRefreshTimestamp = useRef<number>(Date.now());

  // Function to update local deck state without API call
  const updateLocalDeck = useCallback((deck: Deck) => {
    console.log('Updating local deck data with:', deck.title, deck.cards.length, 'cards');
    setFetchedDeck(deck);
    lastRefreshTimestamp.current = Date.now();
  }, []);

  // Refresh function without throttling
  const refreshDeck = useCallback(async () => {
    console.log('Refreshing deck data');
    try {
      await refreshDecks(true); // Always bypass throttle for manual refreshes
      const updatedDeck = getDeck(deckId);
      if (updatedDeck) {
        console.log('Updated deck data received:', updatedDeck.cards.length, 'cards');
        setFetchedDeck(updatedDeck);
        lastRefreshTimestamp.current = Date.now();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing deck data:', error);
      return false;
    }
  }, [deckId, refreshDecks, getDeck]);

  const loadDeckData = useCallback(async () => {
    if (!loading && fetchedDeck && Date.now() - lastRefreshTimestamp.current < 500) {
      console.log('Skipping deck load - recent refresh detected');
      return;
    }
    
    setLoading(true);
    try {
      let deck = getDeck(deckId);
      
      if (!deck) {
        console.log('Deck not found in context, refreshing from API');
        await refreshDecks();
        deck = getDeck(deckId);
      }
      
      if (!deck) {
        toast.error('Deck not found');
        navigate('/dashboard');
        return;
      }
      
      console.log('Loaded deck with', deck.cards.length, 'cards');
      setFetchedDeck(deck);
      lastRefreshTimestamp.current = Date.now();
    } catch (error) {
      console.error('Error loading deck:', error);
      toast.error('Error loading deck');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [deckId, getDeck, navigate, refreshDecks, loading, fetchedDeck]);

  // Load deck when component mounts or deckId changes
  useEffect(() => {
    loadDeckData();
  }, [loadDeckData, updateTrigger]);

  return {
    fetchedDeck,
    loading,
    refreshDeck,
    updateLocalDeck
  };
};
