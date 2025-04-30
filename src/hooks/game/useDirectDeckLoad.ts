
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Deck, Flashcard } from '@/types/deck';
import { DeckMapper } from '@/mappers/DeckMapper';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Cache to store loaded decks in memory
const deckCache = new Map<string, { deck: Deck; timestamp: number }>();
const CACHE_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes (increased from 5)

export const useDirectDeckLoad = (deckId: string | undefined) => {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const navigate = useNavigate();
  const loadingRef = useRef<boolean>(false);

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
    // Prevent multiple simultaneous load attempts
    if (loadingRef.current) {
      console.log('Already loading deck, skipping duplicate request');
      return null;
    }

    if (!deckId) {
      setError('No deck ID provided');
      setIsLoading(false);
      navigate('/dashboard');
      return null;
    }

    loadingRef.current = true;
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
        loadingRef.current = false;
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
        loadingRef.current = false;
        navigate('/dashboard');
        return null;
      }

      // Fetch cards for this deck
      const { data: cardData, error: cardError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('deck_id', deckId)
        .order('created_at', { ascending: true });

      if (cardError) {
        console.error('Error loading cards:', cardError);
        setError(cardError.message);
        toast.error('Failed to load cards');
        setIsLoading(false);
        loadingRef.current = false;
        return null;
      }

      if (!cardData || cardData.length === 0) {
        console.warn('Deck has no cards:', deckId);
        toast.warning('This deck has no cards');
        navigate(`/deck/${deckId}`);
        setIsLoading(false);
        loadingRef.current = false;
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error loading deck';
      setError(errorMessage);
      toast.error('Failed to load deck');
      navigate('/dashboard');
      return null;
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [deckId, navigate, shuffleCards]);

  // Effect to load deck on mount
  useEffect(() => {
    if (!deckId) return;
    
    // Set a small delay to avoid race conditions with route transitions
    const timer = setTimeout(() => {
      loadDeck();
    }, 100);
    
    // Clean up function
    return () => {
      clearTimeout(timer);
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
