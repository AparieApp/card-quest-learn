import { useCallback } from 'react';
import { Flashcard } from '@/types/deck';
import { useGameError } from '../useGameError';

export const usePracticeMode = (setState: Function) => {
  const { handleGameError } = useGameError();

  // In practice mode, we start review with incorrect cards but keep them in review until they meet streak thresholds
  const startPracticeReview = useCallback((incorrectCards: Flashcard[]) => {
    try {
      setState(prev => {
        if (!incorrectCards.length) {
          console.log('No incorrect cards to review');
          return { 
            ...prev, 
            showSummary: true 
          };
        }

        // Shuffle the incorrect cards for review
        const shuffledCards = [...incorrectCards].sort(() => Math.random() - 0.5);
        
        return {
          ...prev,
          reviewCards: shuffledCards,
          isReviewMode: true,
          currentCardIndex: 0,
          showSummary: false,
          showRemovePrompt: false,
          currentCardStreak: {},
          perCardThresholds: {},
          currentCycle: 1,
        };
      });
    } catch (error) {
      handleGameError(error, 'start practice review mode');
    }
  }, [setState, handleGameError]);

  // Process practice mode answer - cards stay in review until user explicitly removes them
  const processPracticeAnswer = useCallback((
    isCorrect: boolean,
    currentCard: Flashcard,
    isReviewMode: boolean,
    incorrectCards: Flashcard[],
    reviewCards: Flashcard[]
  ) => {
    // In practice mode, we maintain incorrect cards across sessions
    let newIncorrectCards = [...incorrectCards];
    let newReviewCards = [...reviewCards];

    if (!isCorrect) {
      // Add incorrect answers to the appropriate collection
      if (isReviewMode) {
        if (!reviewCards.some(c => c.id === currentCard.id)) {
          newReviewCards = [...newReviewCards, currentCard];
        }
      } else if (!incorrectCards.some(c => c.id === currentCard.id)) {
        newIncorrectCards = [...newIncorrectCards, currentCard];
      }
    }

    return { newIncorrectCards, newReviewCards };
  }, []);

  // Check if we should show remove prompt for practice mode
  const shouldShowRemovePrompt = useCallback((
    isCorrect: boolean,
    isReviewMode: boolean,
    streak: number,
    threshold: number
  ) => {
    return isCorrect && isReviewMode && streak >= threshold;
  }, []);

  return {
    startPracticeReview,
    processPracticeAnswer,
    shouldShowRemovePrompt
  };
};
