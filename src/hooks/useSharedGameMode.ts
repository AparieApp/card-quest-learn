
import { useMemo, useCallback, useRef } from 'react';
import { GameMode } from '@/types/game';
import { useGameState } from './game/useGameState';
import { useSharedDeckLoader } from './game/useSharedDeckLoader';
import { useAnswerHandler } from './game/useAnswerHandler';
import { useRemovePrompt } from './game/useRemovePrompt';
import { useGameError } from './game/useGameError';
import { usePracticeControls } from './game/usePracticeControls';
import { usePracticeMode } from './game/modes/usePracticeMode';
import { useTestMode } from './game/modes/useTestMode';

export const useSharedGameMode = (shareCode: string | undefined, mode: GameMode) => {
  // Initialize game state
  const { state, setState, selectors } = useGameState();
  const loadedRef = useRef(false);

  // Initialize error handling
  const { errorState, clearError } = useGameError();

  // Initialize deck loading with shared deck loader - prevents multiple refreshes
  const { loadSharedDeck } = useSharedDeckLoader(shareCode, setState);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = useCallback(<T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Initialize mode-specific handlers
  const { startPracticeReview } = usePracticeMode(setState);
  const { startTestReview } = useTestMode(setState);

  // Review mode handlers based on game mode
  const startReviewMode = useCallback(() => {
    if (mode === 'test') {
      // For test mode, review uses all incorrect cards from the session
      startTestReview(state.incorrectCards);
    } else {
      // For practice mode, use specialized review logic
      startPracticeReview(state.incorrectCards);
    }
  }, [mode, state.incorrectCards, startTestReview, startPracticeReview]);

  // Answer handler
  const handleAnswer = useAnswerHandler({ mode, setState });
  
  // Remove card prompt handler
  const handleRemoveCardPrompt = useRemovePrompt(setState);

  // Practice mode controls
  const {
    endPractice,
    endReviewMode,
    continuePractice,
    restartPractice,
  } = usePracticeControls({ mode, setState, shuffleArray });

  // Memoized derived state
  const gameProgress = useMemo(() => {
    const totalCards = state.isReviewMode ? state.reviewCards.length : state.cards.length;
    if (totalCards === 0) return 0;
    if (state.showSummary) return 100;
    // Show percentage of completed cards
    return Math.round((Math.max(0, state.currentCardIndex) / totalCards) * 100);
  }, [state.cards.length, state.reviewCards.length, state.currentCardIndex, state.isReviewMode, state.showSummary]);

  // Get the active cards (review cards or full deck)
  const activeCards = useMemo(() => {
    return state.isReviewMode ? state.reviewCards : state.cards;
  }, [state.isReviewMode, state.reviewCards, state.cards]);

  // Custom reload function that prevents infinite reloads
  const reloadDeck = useCallback(async () => {
    if (loadedRef.current) {
      console.log('Deck already loaded, skipping reload');
      return;
    }
    loadedRef.current = true;
    await loadSharedDeck();
  }, [loadSharedDeck]);

  // Expose state and handlers
  return {
    ...state,
    cards: activeCards,
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
    reloadDeck
  };
};
