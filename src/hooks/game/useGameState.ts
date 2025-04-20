
import { useState, useCallback, useMemo } from 'react';
import { Deck, Flashcard } from '@/types/deck';

interface GameStats {
  initialCorrect: number;
  overallCorrect: number;
  totalAttempts: number;
}

export interface GameState {
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
  stats: GameStats;
}

export const useGameState = (initialState?: Partial<GameState>) => {
  const [state, setRawState] = useState<GameState>({
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
    ...initialState,
  });

  // Memoized selectors for frequently accessed state
  const currentCard = useMemo(() => {
    if (state.cards.length === 0) return null;
    return state.cards[state.currentCardIndex];
  }, [state.cards, state.currentCardIndex]);

  const progress = useMemo(() => {
    if (state.cards.length === 0) return 0;
    return ((state.currentCardIndex + 1) / state.cards.length) * 100;
  }, [state.cards.length, state.currentCardIndex]);
  
  const isComplete = useMemo(() => {
    return state.showSummary && (!state.isReviewMode || state.reviewCards.length === 0);
  }, [state.showSummary, state.isReviewMode, state.reviewCards.length]);

  // Optimized state setter with validation
  const setState = useCallback((updater: React.SetStateAction<GameState>) => {
    setRawState(prevState => {
      const nextState = typeof updater === 'function' ? updater(prevState) : updater;
      
      // Validate state transition
      if (nextState.currentCardIndex >= nextState.cards.length && nextState.cards.length > 0) {
        console.warn('Invalid card index detected, resetting to 0');
        nextState.currentCardIndex = 0;
      }
      
      return nextState;
    });
  }, []);

  return {
    state,
    setState,
    // Expose memoized selectors
    selectors: {
      currentCard,
      progress,
      isComplete
    }
  };
};
