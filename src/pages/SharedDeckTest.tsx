
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDirectSharedDeckLoad } from '@/hooks/game/useDirectSharedDeckLoad';
import { useGameState } from '@/hooks/game/useGameState';
import { useAnswerHandler } from '@/hooks/game/useAnswerHandler';
import { useRemovePrompt } from '@/hooks/game/useRemovePrompt';
import { useGameError } from '@/hooks/game/useGameError';
import { useTestMode } from '@/hooks/game/modes/useTestMode';
import GameLayout from '@/components/practice/GameLayout';
import { resetAllCircuitBreakers } from '@/utils/circuitBreaker';
import { toast } from 'sonner';

const SharedDeckTest = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  // Reset circuit breakers on mount to ensure fresh start
  useEffect(() => {
    resetAllCircuitBreakers();
  }, []);
  
  // Initialize direct deck loading
  const { deck, cards, isLoading: isDeckLoading, loadSharedDeck } = useDirectSharedDeckLoad(code);
  
  // Add effect to handle empty cards
  useEffect(() => {
    if (!isDeckLoading && cards.length === 0 && deck) {
      console.log('Detected empty cards array but deck exists, attempting refresh');
      loadSharedDeck(true); // Force refresh
    }
  }, [isDeckLoading, cards.length, deck, loadSharedDeck]);
  
  // Initialize game state
  const { state, setState, selectors } = useGameState({
    deck,
    cards,
    isLoading: isDeckLoading,
  });
  
  // Initialize error handling
  const { errorState, clearError } = useGameError();

  // Initialize test mode handler
  const { startTestReview } = useTestMode(setState);

  // Review mode handler
  const startReviewMode = React.useCallback(() => {
    // For test mode, review uses all incorrect cards from the session
    startTestReview(state.incorrectCards);
  }, [state.incorrectCards, startTestReview]);

  // Answer handler
  const handleAnswer = useAnswerHandler({ mode: 'test', setState });
  
  // Remove card prompt handler
  const handleRemoveCardPrompt = useRemovePrompt(setState);

  // Practice controls
  const restartPractice = React.useCallback(() => {
    setState(prev => ({
      ...prev,
      currentCardIndex: 0,
      incorrectCards: [],
      isReviewMode: false,
      showSummary: false,
      stats: {
        initialCorrect: 0,
        overallCorrect: 0,
        totalAttempts: 0
      }
    }));
  }, [setState]);

  // Handle manual refresh
  const handleManualRefresh = React.useCallback(async () => {
    toast.info("Refreshing shared deck data...");
    resetAllCircuitBreakers();
    await loadSharedDeck(true);
    toast.success("Shared deck refreshed");
  }, [loadSharedDeck]);

  // Get the active cards (review cards or full deck)
  const activeCards = React.useMemo(() => {
    return state.isReviewMode ? state.reviewCards : state.cards;
  }, [state.isReviewMode, state.reviewCards, state.cards]);

  // Handle back button click
  const handleBackClick = () => {
    if (confirm('Are you sure you want to leave? Your progress will be lost.')) {
      navigate(`/shared/${code}`);
    }
  };

  // Use the active card pool for determining total cards
  const totalCardCount = activeCards.length;

  return (
    <GameLayout
      isLoading={state.isLoading}
      showSummary={state.showSummary}
      deck={state.deck}
      currentCard={selectors.currentCard}
      currentCardIndex={state.currentCardIndex}
      totalCards={totalCardCount}
      mode="test"
      isReviewMode={state.isReviewMode}
      showRemovePrompt={state.showRemovePrompt}
      stats={state.stats}
      incorrectCards={state.incorrectCards}
      reviewCards={state.reviewCards}
      currentCycle={state.currentCycle}
      shareCode={code}
      onAnswer={handleAnswer}
      onReviewMode={startReviewMode}
      onRemoveCardPrompt={handleRemoveCardPrompt}
      onRestartPractice={restartPractice}
      onBack={handleBackClick}
      onRefresh={handleManualRefresh}
    />
  );
};

export default SharedDeckTest;
