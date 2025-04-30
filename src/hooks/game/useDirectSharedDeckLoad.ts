
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Deck, Flashcard } from '@/types/deck';
import { DeckMapper } from '@/mappers/DeckMapper';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Cache to store loaded decks by share code
const shareCodeCache = new Map<string, { deck: Deck; timestamp: number }>();
const CACHE_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes (increased from 5)

export const useDirectSharedDeckLoad = (shareCode: string | undefined) => {
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

  // Load deck directly from Supabase using share code
  const loadSharedDeck = useCallback(async () => {
    // Prevent multiple simultaneous load attempts
    if (loadingRef.current) {
      console.log('Already loading shared deck, skipping duplicate request');
      return null;
    }

    if (!shareCode) {
      setError('No share code provided');
      setIsLoading(false);
      navigate('/');
      return null;
    }

    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // Check if we have a valid cached version
      const cachedData = shareCodeCache.get(shareCode);
      const now = Date.now();
      
      if (cachedData && now - cachedData.timestamp < CACHE_EXPIRY_TIME) {
        console.log(`Using cached shared deck for code ${shareCode}`);
        setDeck(cachedData.deck);
        setCards(shuffleCards(cachedData.deck.cards));
        setIsLoading(false);
        loadingRef.current = false;
        return cachedData.deck;
      }

      console.log(`Directly loading shared deck with code ${shareCode}`);
      
      // Get deck id from share code
      const { data: shareData, error: shareError } = await supabase
        .from('share_codes')
        .select('deck_id')
        .eq('code', shareCode)
        .single();

      if (shareError || !shareData) {
        console.error('Error finding shared deck:', shareError);
        setError(shareError?.message || 'Shared deck not found');
        toast.error('Shared deck not found');
        navigate('/');
        setIsLoading(false);
        loadingRef.current = false;
        return null;
      }

      const deckId = shareData.deck_id;

      // Fetch the deck
      const { data: deckData, error: deckError } = await supabase
        .from('decks')
        .select('*')
        .eq('id', deckId)
        .single();

      if (deckError || !deckData) {
        console.error('Error loading shared deck:', deckError);
        setError(deckError?.message || 'Shared deck not found');
        toast.error('Failed to load shared deck');
        setIsLoading(false);
        loadingRef.current = false;
        navigate('/');
        return null;
      }

      // Fetch cards for this deck
      const { data: cardData, error: cardError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('deck_id', deckId)
        .order('created_at', { ascending: true });

      if (cardError) {
        console.error('Error loading cards for shared deck:', cardError);
        setError(cardError.message);
        toast.error('Failed to load cards from shared deck');
        setIsLoading(false);
        loadingRef.current = false;
        return null;
      }

      if (!cardData || cardData.length === 0) {
        console.warn('Shared deck has no cards:', deckId);
        toast.warning('This shared deck has no cards');
        navigate(`/shared/${shareCode}`);
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
      shareCodeCache.set(shareCode, { deck: mappedDeck, timestamp: now });
      
      // Set state with loaded data
      setDeck(mappedDeck);
      setCards(shuffleCards(mappedDeck.cards));
      console.log(`Successfully loaded shared deck with ${mappedDeck.cards.length} cards`);
      
      return mappedDeck;
    } catch (error) {
      console.error('Exception loading shared deck:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error loading shared deck';
      setError(errorMessage);
      toast.error('Failed to load shared deck');
      navigate('/');
      return null;
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [shareCode, navigate, shuffleCards]);

  // Effect to load deck on mount
  useEffect(() => {
    if (!shareCode) return;
    
    // Set a small delay to avoid race conditions with route transitions
    const timer = setTimeout(() => {
      loadSharedDeck();
    }, 100);
    
    // Clean up function
    return () => {
      clearTimeout(timer);
    };
  }, [shareCode, loadSharedDeck]);

  return {
    deck,
    cards,
    isLoading,
    error,
    loadSharedDeck,
    shuffleCards
  };
};
