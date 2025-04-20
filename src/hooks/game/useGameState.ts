
import { useState } from 'react';
import { Deck, Flashcard } from '@/types/deck';

interface GameStats {
  initialCorrect: number;
  overallCorrect: number;
  totalAttempts: number;
}

interface GameState {
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
  const [state, setState] = useState<GameState>({
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

  return {
    state,
    setState,
  };
};
