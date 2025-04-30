
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDirectDeckLoad } from '@/hooks/game/useDirectDeckLoad';
import { useGameState } from '@/hooks/game/useGameState';
import { useAnswerHandler } from '@/hooks/game/useAnswerHandler';
import { useRemovePrompt } from '@/hooks/game/useRemovePrompt';
import { useGameError } from '@/hooks/game/useGameError';
import { useTestMode } from '@/hooks/game/modes/useTestMode';
import GameLayout from '@/components/practice/GameLayout';

const Test = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Initialize direct deck loading
  const { deck, cards, isLoading: isDeckLoading } = useDirectDeckLoad(id);
  
  // Initialize game state
  const { state, setState, selectors } = useGameState({
    deck,
    cards,
    isLoading: isDeckLoading,
  });
  
  // Initialize error handling
  const { errorState, clearError } = useGameError();

  // Fisher-Yates shuffle algorithm
  const shuffleArray = React.useCallback(<T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

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

  // Get the active cards (review cards or full deck)
  const activeCards = React.useMemo(() => {
    return state.isReviewMode ? state.reviewCards : state.cards;
  }, [state.isReviewMode, state.reviewCards, state.cards]);

  // Handle back button click
  const handleBackClick = () => {
    if (confirm('Are you sure you want to leave? Your progress will be lost.')) {
      navigate(`/deck/${id}`);
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
      onAnswer={handleAnswer}
      onReviewMode={startReviewMode}
      onRemoveCardPrompt={handleRemoveCardPrompt}
      onRestartPractice={restartPractice}
      onBack={handleBackClick}
    />
  );
};

export default Test;
