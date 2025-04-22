
import { useCallback } from 'react';
import { GameMode } from '@/types/game';
import { Flashcard } from '@/types/deck';
import { useGameError } from './useGameError';
import { usePracticeMode } from './modes/usePracticeMode';
import { useTestMode } from './modes/useTestMode';

interface AnswerHandlerOptions {
  mode: GameMode;
  setState: Function;
}

export const useAnswerHandler = ({ mode, setState }: AnswerHandlerOptions) => {
  const { handleGameError } = useGameError();
  const { processPracticeAnswer, shouldShowRemovePrompt } = usePracticeMode(setState);
  const { processTestAnswer } = useTestMode(setState);

  const handleAnswer = useCallback((isCorrect: boolean) => {
    try {
      setState(prev => {
        if (!prev.cards.length) {
          console.warn('No cards available');
          return prev;
        }

        // Important: Get the current card from the active card pool (review cards or main deck)
        const activeCardPool = prev.isReviewMode ? prev.reviewCards : prev.cards;
        if (activeCardPool.length === 0) {
          console.warn('Active card pool is empty');
          return prev;
        }
        
        const currentCard = activeCardPool[prev.currentCardIndex];
        if (!currentCard) {
          console.warn('Current card not found in active pool');
          return prev;
        }

        console.log(`Processing answer for card ${currentCard.id}, correct: ${isCorrect}, review mode: ${prev.isReviewMode}`);

        // Track streaks per card (mostly for practice mode)
        let newStreak = { ...prev.currentCardStreak };
        let perCardThresholds = { ...(prev.perCardThresholds || {}) };
        const cardId = currentCard.id;

        // Set initial threshold to 3, or keep as-is
        if (!perCardThresholds[cardId]) {
          perCardThresholds[cardId] = prev.streakThreshold; // initial is 3
        }

        // Update streaks based on answer correctness
        if (!isCorrect) {
          // Reset streak for incorrect answers
          newStreak[cardId] = 0;
        } else if (prev.isReviewMode) {
          // Increment streak for correct answers in review mode
          newStreak[cardId] = (newStreak[cardId] || 0) + 1;
        }

        // Determine if we should show remove prompt (practice mode only)
        if (mode === 'practice') {
          const streak = newStreak[cardId] || 0;
          const threshold = perCardThresholds[cardId] || prev.streakThreshold;
          
          if (shouldShowRemovePrompt(isCorrect, prev.isReviewMode, streak, threshold)) {
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

        // Process cards based on game mode
        const { newIncorrectCards, newReviewCards } = mode === 'practice'
          ? processPracticeAnswer(
              isCorrect,
              currentCard,
              prev.isReviewMode,
              prev.incorrectCards,
              prev.reviewCards
            )
          : processTestAnswer(
              isCorrect,
              currentCard,
              prev.isReviewMode,
              prev.incorrectCards,
              prev.reviewCards
            );

        // Handle card flow and cycle management
        let nextIsReviewMode = prev.isReviewMode;
        let nextShowSummary = prev.showSummary;
        let nextCurrentCycle = prev.currentCycle;
        let completedCycles = [...prev.completedCycles];

        // Determine if this is the last card in the active card pool
        const isLastCard = prev.currentCardIndex >= activeCardPool.length - 1;
        
        // For test review mode, we might need to update the card pool for the next index
        let nextActivePool = prev.isReviewMode ? newReviewCards : prev.cards;
        
        // Calculate next card index based on active pool
        let nextCurrentCardIndex = isLastCard ? 0 : prev.currentCardIndex + 1;
        
        // Avoid index out of bounds
        if (nextCurrentCardIndex >= nextActivePool.length && nextActivePool.length > 0) {
          nextCurrentCardIndex = 0;
        }

        console.log(`Card transition: index ${prev.currentCardIndex} -> ${nextCurrentCardIndex}, isLastCard: ${isLastCard}`);

        // Mode-specific end conditions
        if (mode === 'test' && prev.isReviewMode) {
          // In test review mode, check if we're done after last card
          if (isLastCard) {
            if (newReviewCards.length === 0) {
              // All cards answered correctly, show summary
              nextShowSummary = true;
              console.log('Test review complete - all cards correct, showing summary');
            } else {
              // Start a new cycle with remaining incorrect cards
              nextCurrentCycle = prev.currentCycle + 1;
              console.log(`Starting new test review cycle: ${nextCurrentCycle}`);
            }
          }
        } else if (mode === 'test' && isLastCard) {
          // In normal test mode, show summary after going through all cards once
          nextShowSummary = true;
          console.log('Test complete - showing summary');
        } else if (mode === 'practice' && isLastCard) {
          // In practice mode, keep cycling
          if (!completedCycles.includes(prev.currentCycle)) {
            completedCycles.push(prev.currentCycle);
          }
          nextCurrentCycle = prev.currentCycle + 1;
          console.log(`Completed practice cycle ${prev.currentCycle}, starting cycle ${nextCurrentCycle}`);
        }

        return {
          ...prev,
          stats: newStats,
          incorrectCards: newIncorrectCards,
          reviewCards: newReviewCards,
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
  }, [setState, mode, processPracticeAnswer, processTestAnswer, shouldShowRemovePrompt, handleGameError]);

  return handleAnswer;
};
