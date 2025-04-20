
import { useCallback } from 'react';
import { useGameError } from './useGameError';

export const useReviewMode = (setState: Function) => {
  const { handleGameError } = useGameError();
  
  // Optimized Fisher-Yates shuffle algorithm
  const shuffleArray = useCallback(<T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);
  
  const startReviewMode = useCallback(() => {
    try {
      setState(prev => {
        if (prev.incorrectCards.length === 0) {
          return prev; // No cards to review
        }
        
        // Shuffle the review cards for variety
        const shuffledReviewCards = shuffleArray(prev.incorrectCards);
        
        return {
          ...prev,
          reviewCards: shuffledReviewCards,
          isReviewMode: true,
          currentCardIndex: 0,
          showSummary: false,
          showRemovePrompt: false,
        };
      });
    } catch (error) {
      handleGameError(error, 'start review mode');
    }
  }, [setState, shuffleArray, handleGameError]);

  return startReviewMode;
};
