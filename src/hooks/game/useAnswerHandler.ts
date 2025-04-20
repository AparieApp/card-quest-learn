
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
      }
    } 
    // For test mode, we remove correct answers from review cards
    else if (isReviewMode && mode === 'test') {
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
          // Only update initialCorrect on first cycle and not in review mode
          initialCorrect: prev.isReviewMode || prev.currentCycle > 1 ? 
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
              incorrectCards: newIncorrectCards,
              reviewCards: newReviewCards,
              currentCardStreak: newStreak,
              showRemovePrompt: true,
            };
          }
        }
        
        const isLastCard = prev.currentCardIndex >= prev.cards.length - 1;
        
        // Logic for determining game state based on mode and progress
        let nextShowSummary = prev.showSummary;
        let nextIsReviewMode = prev.isReviewMode;
        let nextCurrentCycle = prev.currentCycle;
        let completedCycles = [...prev.completedCycles];
        
        if (isLastCard) {
          if (mode === 'test') {
            if (!prev.isReviewMode) {
              nextShowSummary = true; // Show summary after initial cycle in test mode
            } else if (newReviewCards.length === 0) {
              nextShowSummary = true; // Show final summary when no more review cards in test mode
            } else {
              // Start a new review cycle in test mode with remaining incorrect cards
              nextCurrentCycle = prev.currentCycle + 1;
            }
          } else { // practice mode - now continues until user manually ends
            if (isLastCard) {
              // Add current cycle to completed cycles
              if (!completedCycles.includes(prev.currentCycle)) {
                completedCycles.push(prev.currentCycle);
              }
              // Increment cycle counter for continuous practice
              nextCurrentCycle = prev.currentCycle + 1;
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
          currentCycle: nextCurrentCycle,
          completedCycles: completedCycles,
        };
      });
    } catch (error) {
      handleGameError(error, 'process answer');
    }
  }, [setState, updateCardCollections, handleGameError, mode]);

  return handleAnswer;
};
