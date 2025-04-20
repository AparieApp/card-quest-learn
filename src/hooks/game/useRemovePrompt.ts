
export const useRemovePrompt = (setState: Function) => {
  const handleRemoveCardPrompt = (shouldRemove: boolean) => {
    setState(prev => {
      const currentCard = prev.cards[prev.currentCardIndex];
      
      // Remove card from review if user confirms
      const newReviewCards = shouldRemove 
        ? prev.reviewCards.filter(c => c.id !== currentCard.id)
        : prev.reviewCards;
      
      // Update streak threshold for future prompts
      const newStreakThreshold = shouldRemove
        ? prev.streakThreshold
        : prev.streakThreshold + 2;

      return {
        ...prev,
        reviewCards: newReviewCards,
        showRemovePrompt: false,
        streakThreshold: newStreakThreshold,
        currentCardIndex: prev.currentCardIndex + 1 >= prev.cards.length ? 0 : prev.currentCardIndex + 1,
      };
    });
  };

  return handleRemoveCardPrompt;
};
