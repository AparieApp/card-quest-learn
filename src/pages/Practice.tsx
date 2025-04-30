
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDirectDeckLoad } from '@/hooks/game/useDirectDeckLoad';
import { useGameState } from '@/hooks/game/useGameState';
import { useAnswerHandler } from '@/hooks/game/useAnswerHandler';
import { useRemovePrompt } from '@/hooks/game/useRemovePrompt';
import { useGameError } from '@/hooks/game/useGameError';
import { usePracticeControls } from '@/hooks/game/usePracticeControls';
import { usePracticeMode } from '@/hooks/game/modes/usePracticeMode';
import GameLayout from '@/components/practice/GameLayout';

const Practice = () => {
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

  // Initialize mode-specific handlers
  const { startPracticeReview } = usePracticeMode(setState);

  // Review mode handlers based on game mode
  const startReviewMode = React.useCallback(() => {
    // For practice mode, use specialized review logic
    startPracticeReview(state.incorrectCards);
  }, [state.incorrectCards, startPracticeReview]);

  // Answer handler
  const handleAnswer = useAnswerHandler({ mode: 'practice', setState });
  
  // Remove card prompt handler
  const handleRemoveCardPrompt = useRemovePrompt(setState);

  // Practice mode controls
  const {
    endPractice,
    endReviewMode,
    continuePractice,
    restartPractice,
  } = usePracticeControls({ mode: 'practice', setState, shuffleArray });

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

  // In practice mode we may show cards from multiple cycles, so pass previousCycles
  const previousCycles = cards.filter(card => !state.reviewCards.some(rc => rc.id === card.id));
  
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
      mode="practice"
      isReviewMode={state.isReviewMode}
      showRemovePrompt={state.showRemovePrompt}
      stats={state.stats}
      incorrectCards={state.incorrectCards}
      reviewCards={state.reviewCards}
      previousCycles={previousCycles}
      currentCycle={state.currentCycle}
      currentCardStreak={state.currentCardStreak}
      streakThreshold={state.streakThreshold}
      onAnswer={handleAnswer}
      onReviewMode={startReviewMode}
      onEndPractice={endPractice}
      onEndReviewMode={endReviewMode}
      onContinuePractice={continuePractice}
      onRestartPractice={restartPractice}
      onRemoveCardPrompt={handleRemoveCardPrompt}
      onBack={handleBackClick}
    />
  );
};

export default Practice;
