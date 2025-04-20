
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
    currentCardIndex,
    incorrectCards,
    reviewCards,
    isReviewMode,
    showSummary,
    showRemovePrompt,
    isLoading,
    stats,
    currentCycle,
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

  return (
    <GameLayout
      isLoading={isLoading}
      showSummary={showSummary}
      deck={deck}
      currentCard={cards[currentCardIndex]}
      currentCardIndex={currentCardIndex}
      totalCards={cards.length}
      mode="practice"
      isReviewMode={isReviewMode}
      showRemovePrompt={showRemovePrompt}
      stats={stats}
      incorrectCards={incorrectCards}
      reviewCards={reviewCards}
      currentCycle={currentCycle}
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
