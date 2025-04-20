
import { GameMode } from '@/types/game';

interface AnswerHandlerOptions {
  mode: GameMode;
  setState: Function;
}

export const useAnswerHandler = ({ mode, setState }: AnswerHandlerOptions) => {
  const handleAnswer = (isCorrect: boolean) => {
    setState(prev => {
      const currentCard = prev.cards[prev.currentCardIndex];
      
      // Update streaks for correct answers in review mode
      const newStreak = { ...prev.currentCardStreak };
      if (prev.isReviewMode && isCorrect) {
        newStreak[currentCard.id] = (newStreak[currentCard.id] || 0) + 1;
      } else if (!isCorrect) {
        newStreak[currentCard.id] = 0;
      }
      
      // Stats update logic
      const newStats = {
        initialCorrect: prev.isReviewMode ? 
          prev.stats.initialCorrect : 
          prev.stats.initialCorrect + (isCorrect ? 1 : 0),
        overallCorrect: prev.stats.overallCorrect + (isCorrect ? 1 : 0),
        totalAttempts: prev.stats.totalAttempts + 1,
      };

      // Card management
      let newIncorrectCards = [...prev.incorrectCards];
      let newReviewCards = [...prev.reviewCards];

      if (!isCorrect) {
        if (prev.isReviewMode) {
          if (!newReviewCards.some(c => c.id === currentCard.id)) {
            newReviewCards = [...newReviewCards, currentCard];
          }
        } else {
          if (!newIncorrectCards.some(c => c.id === currentCard.id)) {
            newIncorrectCards = [...newIncorrectCards, currentCard];
          }
          if (!newReviewCards.some(c => c.id === currentCard.id)) {
            newReviewCards = [...newReviewCards, currentCard];
          }
        }
      } else if (prev.isReviewMode) {
        if (mode === 'test') {
          newReviewCards = newReviewCards.filter(c => c.id !== currentCard.id);
        }
        else if (newStreak[currentCard.id] >= prev.streakThreshold) {
          return {
            ...prev,
            stats: newStats,
            currentCardStreak: newStreak,
            showRemovePrompt: true,
          };
        }
      }

      const isLastCard = prev.currentCardIndex >= prev.cards.length - 1;
      
      // Different logic for test vs practice mode
      let nextShowSummary = false;
      let nextIsReviewMode = prev.isReviewMode;
      
      if (isLastCard) {
        if (mode === 'test') {
          if (!prev.isReviewMode) {
            nextShowSummary = true;
            nextIsReviewMode = false;
          } else if (newReviewCards.length === 0) {
            nextShowSummary = true;
          }
        } else {
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
  };

  return handleAnswer;
};
