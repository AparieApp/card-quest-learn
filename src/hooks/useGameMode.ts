
import { useMemo, useCallback } from 'react';
import { GameMode } from '@/types/game';
import { useGameState } from './game/useGameState';
import { useDeckLoader } from './game/useDeckLoader';
import { useAnswerHandler } from './game/useAnswerHandler';
import { useReviewMode } from './game/useReviewMode';
import { useRemovePrompt } from './game/useRemovePrompt';
import { useGameError } from './game/useGameError';
import { usePracticeControls } from './game/usePracticeControls';

export const useGameMode = (deckId: string | undefined, mode: GameMode) => {
  // Initialize game state
  const { state, setState, selectors } = useGameState();
  
  // Initialize error handling
  const { errorState, clearError } = useGameError();
  
  // Initialize deck loading
  const { loadDeck } = useDeckLoader(deckId, setState);
  
  // Fisher-Yates shuffle algorithm - moved here so it can be shared
  const shuffleArray = useCallback(<T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);
  
  // Initialize handlers
  const handleAnswer = useAnswerHandler({ mode, setState });
  const handleRemoveCardPrompt = useRemovePrompt(setState);
  
  const {
    endPractice,
    endReviewMode,
    continuePractice,
    restartPractice,
    startReviewMode
  } = usePracticeControls({ mode, setState, shuffleArray });

  // Memoized derived state
  const gameProgress = useMemo(() => {
    if (state.cards.length === 0) return 0;
    if (state.showSummary) return 100;
    return Math.round(((state.currentCardIndex + 1) / state.cards.length) * 100);
  }, [state.cards.length, state.currentCardIndex, state.showSummary]);
  
  // Expose state and handlers
  return {
    ...state,
    currentCard: selectors.currentCard,
    gameProgress,
    hasError: errorState.hasError,
    errorMessage: errorState.errorMessage,
    clearError,
    handleAnswer,
    startReviewMode,
    handleRemoveCardPrompt,
    endPractice: mode === 'practice' ? endPractice : undefined,
    endReviewMode: mode === 'practice' ? endReviewMode : undefined,
    continuePractice: mode === 'practice' ? continuePractice : undefined,
    restartPractice,
    reloadDeck: loadDeck
  };
};
