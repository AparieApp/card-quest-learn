
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

  // Review mode handler now supports custom cards (for test mode review cycles)
  const handleAnswer = useAnswerHandler({ mode, setState });
  const handleRemoveCardPrompt = useRemovePrompt(setState);

  // New: Give startReviewMode an override for test mode
  const startReviewMode = useCallback(() => {
    if (mode === 'test') {
      // For test mode, review uses all incorrect cards at end of test session
      setState(prev => {
        if (!prev.incorrectCards.length) return prev;
        const shuffled = shuffleArray(prev.incorrectCards);
        return {
          ...prev,
          reviewCards: shuffled,
          isReviewMode: true,
          currentCardIndex: 0,
          showSummary: false,
          showRemovePrompt: false,
          currentCardStreak: {},
          perCardThresholds: {},
          currentCycle: 1,
        };
      });
    } else {
      // Practice mode fallback: only incorrect cards from this session
      setState(prev => {
        if (!prev.incorrectCards.length) return prev;
        const shuffled = shuffleArray(prev.incorrectCards);
        return {
          ...prev,
          reviewCards: shuffled,
          isReviewMode: true,
          currentCardIndex: 0,
          showSummary: false,
          showRemovePrompt: false,
          currentCardStreak: {},
          perCardThresholds: {},
          currentCycle: 1,
        };
      });
    }
  }, [setState, shuffleArray, mode]);

  const {
    endPractice,
    endReviewMode,
    continuePractice,
    restartPractice,
    startReviewMode: origStartReviewMode
  } = usePracticeControls({ mode, setState, shuffleArray });

  // Memoized derived state
  const gameProgress = useMemo(() => {
    if (state.cards.length === 0) return 0;
    if (state.showSummary) return 100;
    // PROGRESS FIX: show percentage of *completed* cards, not "currentCardIndex+1"
    return Math.round((Math.max(0, state.currentCardIndex) / state.cards.length) * 100);
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
    startReviewMode, // use new handler for review
    handleRemoveCardPrompt,
    endPractice: mode === 'practice' ? endPractice : undefined,
    endReviewMode: mode === 'practice' ? endReviewMode : undefined,
    continuePractice: mode === 'practice' ? continuePractice : undefined,
    restartPractice,
    reloadDeck: loadDeck
  };
};
