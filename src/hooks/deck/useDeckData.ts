
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
  const isMounted = useRef(true);

  // Track if the component is mounted to prevent state updates after unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Improved function to update local deck state without API call
  const updateLocalDeck = useCallback((deck: Deck) => {
    if (!isMounted.current) return;
    
    console.log('Updating local deck data with:', deck.title, deck.cards.length, 'cards');
    setFetchedDeck(deck);
    lastRefreshTimestamp.current = Date.now();
  }, []);

  // Improved refresh function with better error handling for mobile
  const refreshDeck = useCallback(async () => {
    if (!isMounted.current) return false;
    
    console.log('Refreshing deck data');
    try {
      await refreshDecks(true); // Always bypass throttle for manual refreshes
      
      // Check if component is still mounted
      if (!isMounted.current) return false;
      
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
      
      // Only show toast if component is still mounted
      if (isMounted.current) {
        toast.error('Could not refresh deck. Please try again.');
      }
      
      return false;
    }
  }, [deckId, refreshDecks, getDeck]);

  // Improved load function with better mobile experience
  const loadDeckData = useCallback(async () => {
    if (!isMounted.current) return;
    
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
        
        // Check if component is still mounted
        if (!isMounted.current) return;
        
        deck = getDeck(deckId);
      }
      
      if (!deck) {
        // Only show toast if component is still mounted
        if (isMounted.current) {
          toast.error('Deck not found');
          navigate('/dashboard');
        }
        return;
      }
      
      console.log('Loaded deck with', deck.cards.length, 'cards');
      
      // Check if component is still mounted before updating state
      if (isMounted.current) {
        setFetchedDeck(deck);
        lastRefreshTimestamp.current = Date.now();
      }
    } catch (error) {
      console.error('Error loading deck:', error);
      
      // Only show toast and navigate if component is still mounted
      if (isMounted.current) {
        toast.error('Error loading deck');
        navigate('/dashboard');
      }
    } finally {
      // Only update loading state if component is still mounted
      if (isMounted.current) {
        setLoading(false);
      }
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
