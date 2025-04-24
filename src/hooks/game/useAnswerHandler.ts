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
  const { 
    processTestAnswer, 
    isTestReviewCycleComplete,
    handleCycleCompletion 
  } = useTestMode(setState);

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
        
        // Ensure index is valid
        const validIndex = Math.min(prev.currentCardIndex, activeCardPool.length - 1);
        if (validIndex !== prev.currentCardIndex) {
          console.warn(`Correcting index from ${prev.currentCardIndex} to ${validIndex}`);
        }
        
        const currentCard = activeCardPool[validIndex];
        if (!currentCard) {
          console.warn('Current card not found in active pool');
          return prev;
        }

        console.log(`Processing answer for card ${currentCard.id}, correct: ${isCorrect}, review mode: ${prev.isReviewMode}, index: ${validIndex}/${activeCardPool.length-1}`);

        // Process answer based on game mode
        const result = mode === 'practice'
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

        // Handle practice mode specific logic
        if (mode === 'practice') {
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
            console.log(`Card ${cardId} streak increased to ${newStreak[cardId]}`);
          }

          // Determine if we should show remove prompt (practice mode only)
          const streak = newStreak[cardId] || 0;
          const threshold = perCardThresholds[cardId] || prev.streakThreshold;
          
          if (shouldShowRemovePrompt(isCorrect, prev.isReviewMode, cardId, streak, threshold)) {
            return {
              ...prev,
              currentCardStreak: newStreak,
              showRemovePrompt: true,
              perCardThresholds,
              currentCardIndex: validIndex, // Use validated index
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

        // Handle cycle management
        let nextIsReviewMode = prev.isReviewMode;
        let nextShowSummary = prev.showSummary;
        let nextCurrentCycle = prev.currentCycle;
        let nextReviewCards = result.newReviewCards;
        let completedCycles = [...prev.completedCycles];
        let nextCurrentCycleCorrect = [...(prev.currentCycleCorrect || []), ...(result.currentCycleCorrect || [])];
        
        const isLastCard = validIndex >= activeCardPool.length - 1;
        let nextCurrentCardIndex = isLastCard ? 0 : validIndex + 1;

        // Test mode specific cycle management
        if (mode === 'test' && prev.isReviewMode) {
          if (isLastCard) {
            // Process cycle completion for test review mode
            nextReviewCards = handleCycleCompletion(prev.reviewCards, nextCurrentCycleCorrect);
            nextCurrentCycleCorrect = []; // Reset for next cycle
            
            if (nextReviewCards.length === 0) {
              nextShowSummary = true;
              console.log('Test review complete - all cards correct, showing summary');
            } else {
              nextCurrentCycle = prev.currentCycle + 1;
              console.log(`Starting new test review cycle: ${nextCurrentCycle} with ${nextReviewCards.length} cards`);
            }
          }
        } else if (mode === 'test' && isLastCard) {
          nextShowSummary = true;
          console.log('Test complete - showing summary');
        }

        return {
          ...prev,
          stats: newStats,
          incorrectCards: result.newIncorrectCards,
          reviewCards: nextReviewCards,
          currentCardIndex: nextCurrentCardIndex,
          isReviewMode: nextIsReviewMode,
          showSummary: nextShowSummary,
          currentCycle: nextCurrentCycle,
          completedCycles: completedCycles,
          currentCycleCorrect: nextCurrentCycleCorrect
        };
      });
    } catch (error) {
      handleGameError(error, 'process answer');
    }
  }, [setState, mode, processPracticeAnswer, processTestAnswer, shouldShowRemovePrompt, handleCycleCompletion, handleGameError]);

  return handleAnswer;
};
