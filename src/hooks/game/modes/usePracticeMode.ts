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
        
        console.log(`Starting practice review with ${shuffledCards.length} incorrect cards`);
        
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
    // In practice mode, we track incorrect cards across all modes
    let newIncorrectCards = [...incorrectCards];
    let newReviewCards = [...reviewCards];

    if (!isCorrect) {
      // Add incorrect answers to the appropriate collection
      if (isReviewMode) {
        console.log(`Practice review: Card ${currentCard.id} answered incorrectly`);
        // In review mode, we're already in the reviewCards pool, no need to re-add
      } else if (!incorrectCards.some(c => c.id === currentCard.id)) {
        // In regular practice, add to incorrectCards pool for later review
        console.log(`Practice: adding card ${currentCard.id} to incorrect cards`);
        newIncorrectCards = [...newIncorrectCards, currentCard];
      }
    }

    return { newIncorrectCards, newReviewCards };
  }, []);

  // Check if we should show remove prompt for practice mode - streak is per card
  const shouldShowRemovePrompt = useCallback((
    isCorrect: boolean,
    isReviewMode: boolean,
    cardId: string,
    streak: number,
    threshold: number
  ) => {
    // Only show remove prompt in review mode when streak meets threshold
    const shouldShow = isCorrect && isReviewMode && streak >= threshold;
    
    if (shouldShow) {
      console.log(`Showing remove prompt for card ${cardId} with streak ${streak}/${threshold}`);
    }
    
    return shouldShow;
  }, []);

  return {
    startPracticeReview,
    processPracticeAnswer,
    shouldShowRemovePrompt
  };
};
