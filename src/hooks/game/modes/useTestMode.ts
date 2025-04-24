
import { Flashcard } from '@/types/deck';
import { useCallback } from 'react';
import { useGameError } from '../useGameError';

export const useTestMode = (setState: Function) => {
  const { handleGameError } = useGameError();

  // In test mode, we start review with incorrect cards
  const startTestReview = useCallback((incorrectCards: Flashcard[]) => {
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
        
        console.log(`Starting test review with ${shuffledCards.length} incorrect cards`);
        
        return {
          ...prev,
          reviewCards: shuffledCards,
          isReviewMode: true,
          currentCardIndex: 0,
          showSummary: false,
          showRemovePrompt: false,
          currentCycleCorrect: [], // Track correct answers within the current cycle
          currentCardStreak: {},
          perCardThresholds: {},
        };
      });
    } catch (error) {
      handleGameError(error, 'start test review mode');
    }
  }, [setState, handleGameError]);

  // Process test mode answer - collect incorrect cards in first pass, manage review cycles
  const processTestAnswer = useCallback((
    isCorrect: boolean,
    currentCard: Flashcard,
    isReviewMode: boolean,
    incorrectCards: Flashcard[],
    reviewCards: Flashcard[]
  ) => {
    // In test mode, we track incorrect answers in first pass
    let newIncorrectCards = [...incorrectCards];
    let newReviewCards = [...reviewCards];
    let currentCycleCorrect: Flashcard[] = [];

    if (isReviewMode) {
      // In review mode, track correct answers but don't remove them yet
      if (isCorrect) {
        console.log(`Test review: marking card ${currentCard.id} as correct for this cycle`);
        currentCycleCorrect = [currentCard];
      }
    } else {
      // In main test mode, collect incorrect answers
      if (!isCorrect && !incorrectCards.some(c => c.id === currentCard.id)) {
        console.log(`Test: adding card ${currentCard.id} to incorrect cards`);
        newIncorrectCards = [...newIncorrectCards, currentCard];
      }
    }

    // Always return currentCycleCorrect to ensure consistent return type
    return { 
      newIncorrectCards, 
      newReviewCards,
      currentCycleCorrect 
    };
  }, []);

  // Calculate whether the review cycle is complete and process card removal
  const isTestReviewCycleComplete = useCallback((currentCardIndex: number, reviewCards: Flashcard[]) => {
    // The cycle is complete when we've gone through all cards
    const isLastCard = currentCardIndex >= reviewCards.length - 1;
    return isLastCard;
  }, []);

  // Handle the completion of a review cycle
  const handleCycleCompletion = useCallback((
    reviewCards: Flashcard[],
    currentCycleCorrect: Flashcard[]
  ) => {
    // Remove correctly answered cards only at cycle completion
    const remainingCards = reviewCards.filter(
      card => !currentCycleCorrect.some(correct => correct.id === card.id)
    );

    console.log(`Cycle complete. Removing ${currentCycleCorrect.length} correct cards. ${remainingCards.length} cards remaining.`);

    return remainingCards;
  }, []);

  return {
    startTestReview,
    processTestAnswer,
    isTestReviewCycleComplete,
    handleCycleCompletion
  };
};
