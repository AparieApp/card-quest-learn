
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Deck, Flashcard } from '@/types/deck';
import { DeckMapper } from '@/mappers/DeckMapper';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Cache to store loaded decks in memory
const deckCache = new Map<string, { deck: Deck; timestamp: number }>();
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

export const useDirectDeckLoad = (deckId: string | undefined) => {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const navigate = useNavigate();

  // Function to shuffle cards using Fisher-Yates algorithm
  const shuffleCards = useCallback((cardsToShuffle: Flashcard[]): Flashcard[] => {
    const shuffled = [...cardsToShuffle];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Load deck directly from Supabase
  const loadDeck = useCallback(async () => {
    if (!deckId) {
      setError('No deck ID provided');
      setIsLoading(false);
      navigate('/dashboard');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if we have a valid cached version
      const cachedData = deckCache.get(deckId);
      const now = Date.now();
      
      if (cachedData && now - cachedData.timestamp < CACHE_EXPIRY_TIME) {
        console.log(`Using cached deck ${deckId}`);
        setDeck(cachedData.deck);
        setCards(shuffleCards(cachedData.deck.cards));
        setIsLoading(false);
        return cachedData.deck;
      }

      console.log(`Directly loading deck ${deckId} from database`);
      
      // Fetch the deck
      const { data: deckData, error: deckError } = await supabase
        .from('decks')
        .select('*')
        .eq('id', deckId)
        .single();

      if (deckError || !deckData) {
        console.error('Error loading deck:', deckError);
        setError(deckError?.message || 'Deck not found');
        toast.error('Failed to load deck');
        setIsLoading(false);
        navigate('/dashboard');
        return null;
      }

      // Fetch cards for this deck
      const { data: cardData, error: cardError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('deck_id', deckId);

      if (cardError) {
        console.error('Error loading cards:', cardError);
        setError(cardError.message);
        toast.error('Failed to load cards');
        setIsLoading(false);
        return null;
      }

      if (!cardData || cardData.length === 0) {
        console.warn('Deck has no cards:', deckId);
        toast.warning('This deck has no cards');
        navigate(`/deck/${deckId}`);
        setIsLoading(false);
        return null;
      }

      // Transform to domain model
      const fullDeck: Deck = {
        ...deckData,
        cards: cardData || [],
      };
      
      const mappedDeck = DeckMapper.toDomain(fullDeck);
      
      // Cache the loaded deck
      deckCache.set(deckId, { deck: mappedDeck, timestamp: now });
      
      // Set state with loaded data
      setDeck(mappedDeck);
      setCards(shuffleCards(mappedDeck.cards));
      console.log(`Successfully directly loaded deck ${deckId} with ${mappedDeck.cards.length} cards`);
      
      return mappedDeck;
    } catch (error) {
      console.error('Exception loading deck:', error);
      setError(error instanceof Error ? error.message : 'Unknown error loading deck');
      toast.error('Failed to load deck');
      navigate('/dashboard');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [deckId, navigate, shuffleCards]);

  // Effect to load deck on mount
  useEffect(() => {
    if (!deckId) return;
    
    loadDeck();
    
    // Clean up function
    return () => {
      // Nothing to clean up
    };
  }, [deckId, loadDeck]);

  return {
    deck,
    cards,
    isLoading,
    error,
    loadDeck,
    shuffleCards
  };
};
