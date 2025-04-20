import { useState, useEffect } from 'react';
import { Deck, Flashcard } from '@/types/deck';
import { useDeck } from '@/context/DeckContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface GameModeState {
  deck: Deck | null;
  cards: Flashcard[];
  currentCardIndex: number;
  incorrectCards: Flashcard[];
  reviewCards: Flashcard[];
  isReviewMode: boolean;
  showSummary: boolean;
  isLoading: boolean;
  showRemovePrompt: boolean;
  currentCardStreak: Record<string, number>;
  streakThreshold: number;
  stats: {
    initialCorrect: number;
    overallCorrect: number;
    totalAttempts: number;
  };
}

export const useGameMode = (deckId: string | undefined, mode: 'practice' | 'test') => {
  const navigate = useNavigate();
  const { getDeck, refreshDecks } = useDeck();
  const [state, setState] = useState<GameModeState>({
    deck: null,
    cards: [],
    currentCardIndex: 0,
    incorrectCards: [],
    reviewCards: [],
    isReviewMode: false,
    showSummary: false,
    isLoading: true,
    showRemovePrompt: false,
    currentCardStreak: {},
    streakThreshold: 3,
    stats: {
      initialCorrect: 0,
      overallCorrect: 0,
      totalAttempts: 0,
    },
  });

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
  }, [deckId, getDeck, navigate, refreshDecks]);

  const handleAnswer = (isCorrect: boolean) => {
    setState(prev => {
      const currentCard = prev.cards[prev.currentCardIndex];
      
      // Update streaks for correct answers in review mode
      const newStreak = { ...prev.currentCardStreak };
      if (prev.isReviewMode && isCorrect) {
        newStreak[currentCard.id] = (newStreak[currentCard.id] || 0) + 1;
      } else if (!isCorrect) {
        // Reset streak on wrong answer
        newStreak[currentCard.id] = 0;
      }
      
      // Stats update logic
      const newStats = {
        initialCorrect: prev.isReviewMode ? 
          prev.stats.initialCorrect : 
          prev.stats.initialCorrect + (isCorrect ? 1 : 0),
        overallCorrect: prev.stats.overallCorrect + (isCorrect ? 1 : 0),
        totalAttempts: prev.stats.totalAttempts + 1,
      };

      // Card management - incorrect cards and review cards
      let newIncorrectCards = [...prev.incorrectCards];
      let newReviewCards = [...prev.reviewCards];

      if (!isCorrect) {
        if (prev.isReviewMode) {
          // Keep in review cards if they get it wrong again
          if (!newReviewCards.some(c => c.id === currentCard.id)) {
            newReviewCards = [...newReviewCards, currentCard];
          }
        } else {
          // Add to both lists in initial mode
          if (!newIncorrectCards.some(c => c.id === currentCard.id)) {
            newIncorrectCards = [...newIncorrectCards, currentCard];
          }
          if (!newReviewCards.some(c => c.id === currentCard.id)) {
            newReviewCards = [...newReviewCards, currentCard];
          }
        }
      } else if (prev.isReviewMode) {
        // For Test mode - remove card from review if correct
        if (mode === 'test') {
          newReviewCards = newReviewCards.filter(c => c.id !== currentCard.id);
        }
        // For Practice mode - check streak against threshold for potential removal
        else if (newStreak[currentCard.id] >= prev.streakThreshold) {
          return {
            ...prev,
            stats: newStats,
            currentCardStreak: newStreak,
            showRemovePrompt: true,
          };
        }
      }

      const isLastCard = prev.currentCardIndex >= prev.cards.length - 1;
      
      // Different logic for test vs practice mode
      let nextShowSummary = false;
      let nextIsReviewMode = prev.isReviewMode;
      
      if (isLastCard) {
        if (mode === 'test') {
          if (!prev.isReviewMode) {
            // Test mode always shows summary after first cycle
            nextShowSummary = true;
            nextIsReviewMode = false;
          } else if (newReviewCards.length === 0) {
            // If no more review cards in review mode, show final summary
            nextShowSummary = true;
          } else {
            // Continue with remaining review cards
            nextShowSummary = false;
          }
        } else {
          // Practice mode logic
          if (prev.isReviewMode && newReviewCards.length === 0) {
            // If no more review cards in review mode, show summary
            nextShowSummary = true;
          } else if (!prev.isReviewMode && newReviewCards.length > 0) {
            // Auto start review mode if there are incorrect cards
            nextIsReviewMode = true;
            nextShowSummary = false;
          } else {
            // Continue practicing
            nextShowSummary = false;
          }
        }
      }

      return {
        ...prev,
        stats: newStats,
        incorrectCards: newIncorrectCards,
        reviewCards: newReviewCards,
        currentCardIndex: isLastCard ? 0 : prev.currentCardIndex + 1,
        isReviewMode: nextIsReviewMode,
        showSummary: nextShowSummary,
        currentCardStreak: newStreak,
      };
    });
  };

  const startReviewMode = () => {
    if (state.incorrectCards.length > 0) {
      // Shuffle the review cards for variety
      const shuffledReviewCards = [...state.incorrectCards].sort(() => Math.random() - 0.5);
      
      setState(prev => ({
        ...prev,
        reviewCards: shuffledReviewCards,
        isReviewMode: true,
        currentCardIndex: 0,
        showSummary: false,
        showRemovePrompt: false,
      }));
    }
  };

  const handleRemoveCardPrompt = (shouldRemove: boolean) => {
    setState(prev => {
      const currentCard = prev.cards[prev.currentCardIndex];
      
      // Remove card from review if user confirms
      const newReviewCards = shouldRemove 
        ? prev.reviewCards.filter(c => c.id !== currentCard.id)
        : prev.reviewCards;
      
      // Update streak threshold for future prompts
      const newStreakThreshold = shouldRemove
        ? prev.streakThreshold
        : prev.streakThreshold + 2;

      return {
        ...prev,
        reviewCards: newReviewCards,
        showRemovePrompt: false,
        streakThreshold: newStreakThreshold,
        currentCardIndex: prev.currentCardIndex + 1 >= prev.cards.length ? 0 : prev.currentCardIndex + 1,
      };
    });
  };

  return {
    ...state,
    handleAnswer,
    startReviewMode,
    handleRemoveCardPrompt,
  };
};
