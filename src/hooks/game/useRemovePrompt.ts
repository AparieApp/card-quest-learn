
import { useCallback } from 'react';
import { useGameError } from './useGameError';

export const useRemovePrompt = (setState: Function) => {
  const { handleGameError } = useGameError();

  const handleRemoveCardPrompt = useCallback((shouldRemove: boolean) => {
    try {
      setState(prev => {
        // Always work with the active card pool (reviewCards in review mode)
        const activeCardPool = prev.isReviewMode ? prev.reviewCards : prev.cards;
        
        // Validate current index is within bounds
        if (prev.currentCardIndex < 0 || prev.currentCardIndex >= activeCardPool.length) {
          console.warn(`Invalid card index: ${prev.currentCardIndex} for pool of ${activeCardPool.length} cards`);
          return prev;
        }
        
        const currentCard = activeCardPool[prev.currentCardIndex];
        if (!currentCard) {
          console.warn('Current card not found in active pool');
          return prev;
        }

        console.log(`Processing remove prompt for card ${currentCard.id}, shouldRemove: ${shouldRemove}`);

        // Only remove from reviewCards - this is important since we're in review mode when showing prompts
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
          console.log(`User kept card ${cardId}, increasing threshold to ${perCardThresholds[cardId]}`);
        } else {
          // Reset threshold to default for this card if removed
          delete perCardThresholds[cardId];
          console.log(`User removed card ${cardId} from review pool, ${newReviewCards.length} cards remaining`);
        }

        // Calculate the next card index after removal
        let nextCardIndex = prev.currentCardIndex;
        
        // If we removed the current card and it was the last one in the pool,
        // we need to adjust the index to point to the new last card
        if (shouldRemove && nextCardIndex >= newReviewCards.length) {
          nextCardIndex = Math.max(0, newReviewCards.length - 1);
          console.log(`Adjusting card index to ${nextCardIndex} after removal (${newReviewCards.length} cards remain)`);
        }
        
        // If no cards left in review, show summary
        const showSummary = newReviewCards.length === 0 ? true : prev.showSummary;
        
        if (newReviewCards.length === 0) {
          console.log('No cards left in review pool, showing summary');
        }

        return {
          ...prev,
          reviewCards: newReviewCards,
          showRemovePrompt: false,
          perCardThresholds,
          currentCardIndex: nextCardIndex,
          showSummary,
        };
      });
    } catch (error) {
      handleGameError(error, 'process card removal');
    }
  }, [setState, handleGameError]);

  return handleRemoveCardPrompt;
};
