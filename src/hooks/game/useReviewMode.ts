
export const useReviewMode = (setState: Function) => {
  const startReviewMode = () => {
    setState(prev => {
      if (prev.incorrectCards.length > 0) {
        // Shuffle the review cards for variety
        const shuffledReviewCards = [...prev.incorrectCards].sort(() => Math.random() - 0.5);
        
        return {
          ...prev,
          reviewCards: shuffledReviewCards,
          isReviewMode: true,
          currentCardIndex: 0,
          showSummary: false,
          showRemovePrompt: false,
        };
      }
      return prev;
    });
  };

  return startReviewMode;
};
