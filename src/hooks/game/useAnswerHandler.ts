
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
    // For test mode, we remove correct answers from review cards after each correct answer in review
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

        // Update streaks per card in review mode
        let newStreak = { ...prev.currentCardStreak };
        let perCardThresholds = { ...(prev.perCardThresholds || {}) };
        const cardId = currentCard.id;
        if (!perCardThresholds[cardId]) {
          perCardThresholds[cardId] = prev.streakThreshold;
        }

        // If wrong, reset streak for this card
        if (!isCorrect) {
          newStreak[cardId] = 0;
        } else if (prev.isReviewMode) {
          newStreak[cardId] = (newStreak[cardId] || 0) + 1;
        }

        // If the answer is correct and in review mode (practice) prompt with 3 (+1)s
        if (isCorrect && prev.isReviewMode && mode === 'practice') {
          const streak = newStreak[cardId] || 0;
          const threshold = perCardThresholds[cardId] || prev.streakThreshold;
          if (streak >= threshold) {
            return {
              ...prev,
              currentCardStreak: newStreak,
              showRemovePrompt: true,
              perCardThresholds,
            };
          }
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

        // TEST MODE: In review, if answer is correct remove from reviewCards immediately; show summary when no more
        let nextIsReviewMode = prev.isReviewMode;
        let nextShowSummary = prev.showSummary;
        let nextCurrentCycle = prev.currentCycle;
        let completedCycles = [...prev.completedCycles];

        const isLastCard = prev.currentCardIndex >= prev.cards.length - 1;
        let nextCurrentCardIndex = isLastCard ? 0 : prev.currentCardIndex + 1;
        let nextReviewCards = newReviewCards;

        if (mode === 'test' && prev.isReviewMode) {
          // Only cards currently in review are being rotated (newReviewCards already filtered)
          if (isLastCard) {
            // If no incorrect left, end review
            if (newReviewCards.length === 0) {
              nextShowSummary = true;
            } else {
              // Start a new cycle with the remaining review cards not yet answered correctly
              nextCurrentCycle = prev.currentCycle + 1;
            }
          }
        } else if (mode === 'test') {
          // Initial test session: at last card, go to summary
          if (isLastCard && !prev.isReviewMode) {
            nextShowSummary = true;
          }
        } else { // practice mode - continuous cycles
          if (isLastCard) {
            // Add current cycle to completed cycles
            if (!completedCycles.includes(prev.currentCycle)) {
              completedCycles.push(prev.currentCycle);
            }
            nextCurrentCycle = prev.currentCycle + 1;
          }
        }

        return {
          ...prev,
          stats: newStats,
          incorrectCards: newIncorrectCards,
          reviewCards: nextReviewCards,
          currentCardIndex: nextCurrentCardIndex,
          isReviewMode: nextIsReviewMode,
          showSummary: nextShowSummary,
          currentCardStreak: newStreak,
          perCardThresholds,
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
