
import { useMemo } from 'react';
import { GameMode } from '@/types/game';
import { useGameState } from './game/useGameState';
import { useDeckLoader } from './game/useDeckLoader';
import { useAnswerHandler } from './game/useAnswerHandler';
import { useReviewMode } from './game/useReviewMode';
import { useRemovePrompt } from './game/useRemovePrompt';
import { useGameError } from './game/useGameError';

export const useGameMode = (deckId: string | undefined, mode: GameMode) => {
  // Initialize game state
  const { state, setState, selectors } = useGameState();
  
  // Initialize error handling
  const { errorState, clearError } = useGameError();
  
  // Initialize deck loading
  const { loadDeck } = useDeckLoader(deckId, setState);
  
  // Initialize handlers
  const handleAnswer = useAnswerHandler({ mode, setState });
  const startReviewMode = useReviewMode(setState);
  const handleRemoveCardPrompt = useRemovePrompt(setState);

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
    reloadDeck: loadDeck
  };
};
