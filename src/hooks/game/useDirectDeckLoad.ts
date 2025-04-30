
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Deck, Flashcard } from '@/types/deck';
import { DeckMapper } from '@/mappers/DeckMapper';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { CircuitBreaker } from '@/utils/circuitBreaker';

// Cache to store loaded decks in memory
const deckCache = new Map<string, { deck: Deck; timestamp: number }>();
const CACHE_EXPIRY_TIME = 15 * 60 * 1000; // 15 minutes (increased from 10)
const MAX_RETRY_ATTEMPTS = 2;

export const useDirectDeckLoad = (deckId: string | undefined) => {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const navigate = useNavigate();
  const loadingRef = useRef<boolean>(false);
  const retryAttemptsRef = useRef<number>(0);

  // Function to shuffle cards using Fisher-Yates algorithm
  const shuffleCards = useCallback((cardsToShuffle: Flashcard[]): Flashcard[] => {
    if (!cardsToShuffle || cardsToShuffle.length === 0) {
      console.warn('Attempted to shuffle empty or undefined cards array');
      return [];
    }
    
    const shuffled = [...cardsToShuffle];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Load deck directly from Supabase
  const loadDeck = useCallback(async (forceRefresh = false) => {
    // Prevent multiple simultaneous load attempts
    if (loadingRef.current) {
      console.log('Already loading deck, skipping duplicate request');
      return null;
    }

    if (!deckId) {
      console.error('No deck ID provided when trying to load deck');
      setError('No deck ID provided');
      setIsLoading(false);
      navigate('/dashboard');
      return null;
    }

    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // Check if we have a valid cached version (and not forcing refresh)
      const cachedData = deckCache.get(deckId);
      const now = Date.now();
      
      if (!forceRefresh && cachedData && now - cachedData.timestamp < CACHE_EXPIRY_TIME) {
        console.log(`Using cached deck ${deckId} with ${cachedData.deck.cards.length} cards`);
        
        // Don't use cache if it has 0 cards (likely a caching issue)
        if (cachedData.deck.cards.length === 0) {
          console.log('Cached deck has 0 cards, ignoring cache and loading from database');
        } else {
          setDeck(cachedData.deck);
          setCards(shuffleCards(cachedData.deck.cards));
          setIsLoading(false);
          loadingRef.current = false;
          return cachedData.deck;
        }
      }

      console.log(`Directly loading deck ${deckId} from database`);
      
      // Use circuit breaker with more permissive settings
      const circuitBreaker = CircuitBreaker.getInstance(`deck-${deckId}`, {
        failureThreshold: 8,     // Increased from 5
        resetTimeout: 3000,      // Decreased from 5000
        maxRequestsInHalfOpen: 3 // Increased from 2
      });
      
      // Fetch the deck with circuit breaker
      const fetchDeck = async () => {
        const { data: deckData, error: deckError } = await supabase
          .from('decks')
          .select('*')
          .eq('id', deckId)
          .single();

        if (deckError || !deckData) {
          console.error('Error loading deck:', deckError);
          throw new Error(deckError?.message || 'Deck not found');
        }
        
        return deckData;
      };

      // Fetch cards for this deck with circuit breaker
      const fetchCards = async () => {
        const { data: cardData, error: cardError } = await supabase
          .from('flashcards')
          .select('*')
          .eq('deck_id', deckId)
          .order('created_at', { ascending: true });

        if (cardError) {
          console.error('Error loading cards:', cardError);
          throw new Error(cardError.message);
        }
        
        // Log card data to help diagnose issues
        console.log(`Fetched ${cardData?.length || 0} cards for deck ${deckId}`);
        
        return cardData || [];
      };

      // Execute with circuit breaker
      const deckData = await circuitBreaker.execute(fetchDeck);
      const cardData = await circuitBreaker.execute(fetchCards);

      // Check if we have cards
      if (!cardData || cardData.length === 0) {
        console.warn(`Deck ${deckId} has no cards in the database`);
        
        // If this is the first attempt, retry once more
        if (retryAttemptsRef.current < MAX_RETRY_ATTEMPTS) {
          retryAttemptsRef.current++;
          console.log(`Retrying card fetch (attempt ${retryAttemptsRef.current}/${MAX_RETRY_ATTEMPTS})...`);
          
          // Wait a short time before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Try a direct card fetch without circuit breaker as a backup
          const { data: retryCardData } = await supabase
            .from('flashcards')
            .select('*')
            .eq('deck_id', deckId)
            .order('created_at', { ascending: true });
            
          if (retryCardData && retryCardData.length > 0) {
            console.log(`Retry successful! Found ${retryCardData.length} cards.`);
            cardData.push(...retryCardData);
          } else {
            console.warn('Retry also returned no cards');
            toast.warning('This deck has no cards');
            navigate(`/deck/${deckId}`);
            setIsLoading(false);
            loadingRef.current = false;
            return null;
          }
        } else {
          console.warn('Max retry attempts reached, no cards found');
          toast.warning('This deck has no cards');
          navigate(`/deck/${deckId}`);
          setIsLoading(false);
          loadingRef.current = false;
          return null;
        }
      }

      // Reset retry counter
      retryAttemptsRef.current = 0;

      // Transform to domain model
      const fullDeck: Deck = {
        ...deckData,
        cards: cardData || [],
      };
      
      const mappedDeck = DeckMapper.toDomain(fullDeck);
      
      // Log card count for debugging
      console.log(`Mapping complete. Deck has ${mappedDeck.cards.length} cards.`);
      
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

  // Force refresh function
  const refreshDeck = useCallback(() => {
    return loadDeck(true);
  }, [loadDeck]);

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
    refreshDeck,
    shuffleCards
  };
};
