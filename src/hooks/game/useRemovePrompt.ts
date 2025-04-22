import { useCallback } from 'react';
import { useGameError } from './useGameError';

export const useRemovePrompt = (setState: Function) => {
  const { handleGameError } = useGameError();

  // Each card streak threshold is tracked per card now
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

        // Get or initialize streak thresholds per card
        const perCardThresholds = { ...(prev.perCardThresholds || {}) };

        const cardId = currentCard.id;
        if (!perCardThresholds[cardId]) {
          perCardThresholds[cardId] = prev.streakThreshold; // usually 3
        }

        if (!shouldRemove) {
          // User said no, so increment threshold for future prompts
          perCardThresholds[cardId] = (perCardThresholds[cardId] || prev.streakThreshold) + 1;
          // The next prompt for this card will occur after another +1 streak count
        } else {
          // reset threshold to default for this card if removed
          delete perCardThresholds[cardId];
        }

        // Ensure valid next card index
        const nextCardIndex = prev.currentCardIndex + 1 >= prev.cards.length 
          ? 0 
          : prev.currentCardIndex + 1;

        return {
          ...prev,
          reviewCards: newReviewCards,
          showRemovePrompt: false,
          perCardThresholds,
          currentCardIndex: nextCardIndex,
        };
      });
    } catch (error) {
      handleGameError(error, 'process card removal');
    }
  }, [setState, handleGameError]);

  return handleRemoveCardPrompt;
};
