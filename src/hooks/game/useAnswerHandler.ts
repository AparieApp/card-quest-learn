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

        let newStreak = { ...prev.currentCardStreak };
        let perCardThresholds = { ...(prev.perCardThresholds || {}) };
        const cardId = currentCard.id;

        // Set initial threshold to 3, or keep as-is
        if (!perCardThresholds[cardId]) {
          perCardThresholds[cardId] = prev.streakThreshold; // initial is 3
        }

        // --- ADJUSTED REMOVE PROMPT LOGIC (3→4→5→...) ---

        // If wrong, reset streak for this card
        if (!isCorrect) {
          newStreak[cardId] = 0;
          // When user gets a card wrong after having said "No" to the prompt, we want to prompt again at the *current* threshold (e.g., 4 or 5).
          // So, the next time the user gets the streak up to current threshold count, prompt again.
          // No change to threshold counter, just streak reset.
        } else if (prev.isReviewMode) {
          newStreak[cardId] = (newStreak[cardId] || 0) + 1;
        }

        // Prompt logic: prompt at *each* value where streak equals the card's threshold (3, 4, 5, etc)
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

        // REVIEW/TEST MODE CARD FLOW ...
        let nextIsReviewMode = prev.isReviewMode;
        let nextShowSummary = prev.showSummary;
        let nextCurrentCycle = prev.currentCycle;
        let completedCycles = [...prev.completedCycles];

        const isLastCard = prev.currentCardIndex >= prev.cards.length - 1;
        let nextCurrentCardIndex = isLastCard ? 0 : prev.currentCardIndex + 1;
        let nextReviewCards = newReviewCards;

        if (mode === 'test' && prev.isReviewMode) {
          if (isLastCard) {
            if (newReviewCards.length === 0) {
              nextShowSummary = true;
            } else {
              nextCurrentCycle = prev.currentCycle + 1;
            }
          }
        } else if (mode === 'test') {
          if (isLastCard && !prev.isReviewMode) {
            nextShowSummary = true;
          }
        } else {
          if (isLastCard) {
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
