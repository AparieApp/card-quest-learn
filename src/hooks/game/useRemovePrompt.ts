
import { useCallback } from 'react';
import { useGameError } from './useGameError';

export const useRemovePrompt = (setState: Function) => {
  const { handleGameError } = useGameError();
  
  const handleRemoveCardPrompt = useCallback((shouldRemove: boolean) => {
    try {
      setState(prev => {
        const currentCard = prev.cards[prev.currentCardIndex];
        if (!currentCard) {
          console.warn('Current card not found');
          return prev;
        }
        
        // Remove card from review if user confirms
        const newReviewCards = shouldRemove 
          ? prev.reviewCards.filter(c => c.id !== currentCard.id)
          : prev.reviewCards;
        
        // Update streak threshold for future prompts
        const newStreakThreshold = shouldRemove
          ? prev.streakThreshold
          : prev.streakThreshold + 2;
        
        // Ensure valid next card index
        const nextCardIndex = prev.currentCardIndex + 1 >= prev.cards.length 
          ? 0 
          : prev.currentCardIndex + 1;

        return {
          ...prev,
          reviewCards: newReviewCards,
          showRemovePrompt: false,
          streakThreshold: newStreakThreshold,
          currentCardIndex: nextCardIndex,
        };
      });
    } catch (error) {
      handleGameError(error, 'process card removal');
    }
  }, [setState, handleGameError]);

  return handleRemoveCardPrompt;
};
