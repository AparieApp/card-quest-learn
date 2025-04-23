
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
  perCardThresholds?: Record<string, number>; // per-card thresholds for remove prompt
  stats: GameStats;
  currentCycle: number;
  completedCycles: number[];
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
    perCardThresholds: {},
    stats: {
      initialCorrect: 0,
      overallCorrect: 0,
      totalAttempts: 0,
    },
    currentCycle: 1,
    completedCycles: [],
    ...initialState,
  });

  // Memoized selectors for frequently accessed state
  const currentCard = useMemo(() => {
    // Get the active card pool based on mode
    const activeCardPool = state.isReviewMode ? state.reviewCards : state.cards;
    
    if (activeCardPool.length === 0) return null;
    
    // Ensure we're using a valid index
    const validIndex = Math.min(state.currentCardIndex, activeCardPool.length - 1);
    return activeCardPool[validIndex];
  }, [state.cards, state.reviewCards, state.currentCardIndex, state.isReviewMode]);

  const progress = useMemo(() => {
    const totalCards = state.isReviewMode ? state.reviewCards.length : state.cards.length;
    if (totalCards === 0) return 0;
    return ((Math.min(state.currentCardIndex + 1, totalCards)) / totalCards) * 100;
  }, [state.cards.length, state.reviewCards.length, state.currentCardIndex, state.isReviewMode]);
  
  const isComplete = useMemo(() => {
    return state.showSummary && (!state.isReviewMode || state.reviewCards.length === 0);
  }, [state.showSummary, state.isReviewMode, state.reviewCards.length]);

  // Optimized state setter with validation
  const setState = useCallback((updater: React.SetStateAction<GameState>) => {
    setRawState(prevState => {
      const nextState = typeof updater === 'function' ? updater(prevState) : updater;
      
      // Validate state transition based on active card pool
      const totalCards = nextState.isReviewMode ? nextState.reviewCards.length : nextState.cards.length;
      
      if (totalCards > 0 && nextState.currentCardIndex >= totalCards) {
        console.warn(`Invalid card index ${nextState.currentCardIndex} for ${totalCards} cards, resetting to 0`);
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
