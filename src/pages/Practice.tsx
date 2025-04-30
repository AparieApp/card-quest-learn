
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameMode } from '@/hooks/useGameMode';
import GameLayout from '@/components/practice/GameLayout';

const Practice = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    deck,
    cards,
    currentCard,
    currentCardIndex,
    incorrectCards,
    reviewCards,
    isReviewMode,
    showSummary,
    showRemovePrompt,
    isLoading,
    stats,
    currentCycle,
    currentCardStreak,
    streakThreshold,
    handleAnswer,
    startReviewMode,
    handleRemoveCardPrompt,
    endPractice,
    endReviewMode,
    continuePractice,
    restartPractice,
  } = useGameMode(id, 'practice');
  
  const handleBackClick = () => {
    if (confirm('Are you sure you want to leave? Your progress will be lost.')) {
      navigate(`/deck/${id}`);
    }
  };

  // In practice mode we may show cards from multiple cycles, so pass previousCycles
  const previousCycles = cards.filter(card => !reviewCards.some(rc => rc.id === card.id));
  
  // Use the active card pool for determining total cards
  const activeCardPool = isReviewMode ? reviewCards : cards;
  const totalCardCount = activeCardPool.length;

  return (
    <GameLayout
      isLoading={isLoading}
      showSummary={showSummary}
      deck={deck}
      currentCard={currentCard}
      currentCardIndex={currentCardIndex}
      totalCards={totalCardCount}
      mode="practice"
      isReviewMode={isReviewMode}
      showRemovePrompt={showRemovePrompt}
      stats={stats}
      incorrectCards={incorrectCards}
      reviewCards={reviewCards}
      previousCycles={previousCycles}
      currentCycle={currentCycle}
      currentCardStreak={currentCardStreak}
      streakThreshold={streakThreshold}
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
