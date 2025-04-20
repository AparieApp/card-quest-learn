
import { useCallback } from 'react';
import { GameMode } from '@/types/game';
import { Flashcard } from '@/types/deck';
import { useGameError } from './useGameError';

interface AnswerHandlerOptions {
  mode: GameMode;
  setState: Function;
}

export const useAnswerHandler = ({ mode, setState }: AnswerHandlerOptions) => {
  const { handleGameError } = useGameError();
  
  // Helper function to update card collections efficiently
  const updateCardCollections = useCallback((
    isCorrect: boolean,
    currentCard: Flashcard,
    isReviewMode: boolean,
    incorrectCards: Flashcard[],
    reviewCards: Flashcard[]
  ) => {
    let newIncorrectCards = [...incorrectCards];
    let newReviewCards = [...reviewCards];
    
    if (!isCorrect) {
      // Add to incorrect cards if not already there
      if (isReviewMode) {
        if (!reviewCards.some(c => c.id === currentCard.id)) {
          newReviewCards = [...newReviewCards, currentCard];
        }
      } else {
        if (!incorrectCards.some(c => c.id === currentCard.id)) {
          newIncorrectCards = [...newIncorrectCards, currentCard];
        }
        if (!reviewCards.some(c => c.id === currentCard.id)) {
          newReviewCards = [...newReviewCards, currentCard];
        }
      }
    } else if (isReviewMode && mode === 'test') {
      newReviewCards = newReviewCards.filter(c => c.id !== currentCard.id);
    }
    
    return { newIncorrectCards, newReviewCards };
  }, [mode]);
  
  const handleAnswer = useCallback((isCorrect: boolean) => {
    try {
      setState(prev => {
        if (!prev.cards.length) {
          console.warn('No cards available');
          return prev;
        }
        
        const currentCard = prev.cards[prev.currentCardIndex];
        if (!currentCard) {
          console.warn('Current card not found');
          return prev;
        }
        
        // Update streaks for correct answers in review mode
        const newStreak = { ...prev.currentCardStreak };
        if (prev.isReviewMode && isCorrect) {
          newStreak[currentCard.id] = (newStreak[currentCard.id] || 0) + 1;
        } else if (!isCorrect) {
          newStreak[currentCard.id] = 0;
        }
        
        // Update statistics
        const newStats = {
          initialCorrect: prev.isReviewMode ? 
            prev.stats.initialCorrect : 
            prev.stats.initialCorrect + (isCorrect ? 1 : 0),
          overallCorrect: prev.stats.overallCorrect + (isCorrect ? 1 : 0),
          totalAttempts: prev.stats.totalAttempts + 1,
        };
        
        // Card management - optimized with helper function
        const { newIncorrectCards, newReviewCards } = updateCardCollections(
          isCorrect, 
          currentCard, 
          prev.isReviewMode, 
          prev.incorrectCards, 
          prev.reviewCards
        );
        
        // Check for streak-based removal prompt
        if (isCorrect && prev.isReviewMode && mode === 'practice') {
          if (newStreak[currentCard.id] >= prev.streakThreshold) {
            return {
              ...prev,
              stats: newStats,
              currentCardStreak: newStreak,
              showRemovePrompt: true,
            };
          }
        }
        
        const isLastCard = prev.currentCardIndex >= prev.cards.length - 1;
        
        // Logic for determining game state based on mode and progress
        let nextShowSummary = prev.showSummary;
        let nextIsReviewMode = prev.isReviewMode;
        
        if (isLastCard) {
          if (mode === 'test') {
            if (!prev.isReviewMode) {
              nextShowSummary = true;
              nextIsReviewMode = false;
            } else if (newReviewCards.length === 0) {
              nextShowSummary = true;
            }
          } else { // practice mode
            if (prev.isReviewMode && newReviewCards.length === 0) {
              nextShowSummary = true;
            } else if (!prev.isReviewMode && newReviewCards.length > 0) {
              nextIsReviewMode = true;
            }
          }
        }
        
        return {
          ...prev,
          stats: newStats,
          incorrectCards: newIncorrectCards,
          reviewCards: newReviewCards,
          currentCardIndex: isLastCard ? 0 : prev.currentCardIndex + 1,
          isReviewMode: nextIsReviewMode,
          showSummary: nextShowSummary,
          currentCardStreak: newStreak,
        };
      });
    } catch (error) {
      handleGameError(error, 'process answer');
    }
  }, [setState, updateCardCollections, handleGameError, mode]);

  return handleAnswer;
};
