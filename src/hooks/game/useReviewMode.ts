
// This file is kept for backwards compatibility
// The functionality has been moved to mode-specific hooks:
// - usePracticeMode.ts for practice mode review
// - useTestMode.ts for test mode review

import { useCallback } from 'react';
import { useGameError } from './useGameError';
import { usePracticeMode } from './modes/usePracticeMode';
import { useTestMode } from './modes/useTestMode';
import { GameMode } from '@/types/game';
import { Flashcard } from '@/types/deck';

export const useReviewMode = (setState: Function) => {
  const { handleGameError } = useGameError();
  const { startPracticeReview } = usePracticeMode(setState);
  const { startTestReview } = useTestMode(setState);

  // Optimized Fisher-Yates shuffle algorithm
  const shuffleArray = useCallback(<T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const startReviewMode = useCallback((options?: { 
    mode?: GameMode, 
    incorrectCards?: Flashcard[] 
  }) => {
    try {
      const mode = options?.mode || 'practice';
      const cards = options?.incorrectCards;
      
      if (mode === 'test') {
        startTestReview(cards || []);
      } else {
        startPracticeReview(cards || []);
      }
    } catch (error) {
      handleGameError(error, 'start review mode');
    }
  }, [startTestReview, startPracticeReview, handleGameError]);

  return startReviewMode;
};
