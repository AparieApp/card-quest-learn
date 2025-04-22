
import { useCallback } from 'react';
import { Flashcard } from '@/types/deck';
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
          currentCardStreak: {},
          perCardThresholds: {},
        };
      });
    } catch (error) {
      handleGameError(error, 'start test review mode');
    }
  }, [setState, handleGameError]);

  // Process test mode answer - correct answers remove cards from review immediately
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

    if (isReviewMode) {
      // In review mode, remove cards that are answered correctly
      if (isCorrect) {
        console.log(`Test review: removing card ${currentCard.id} after correct answer`);
        newReviewCards = newReviewCards.filter(c => c.id !== currentCard.id);
      }
    } else {
      // In main test mode, collect incorrect answers
      if (!isCorrect && !incorrectCards.some(c => c.id === currentCard.id)) {
        console.log(`Test: adding card ${currentCard.id} to incorrect cards`);
        newIncorrectCards = [...newIncorrectCards, currentCard];
      }
    }

    return { newIncorrectCards, newReviewCards };
  }, []);

  return {
    startTestReview,
    processTestAnswer
  };
};
