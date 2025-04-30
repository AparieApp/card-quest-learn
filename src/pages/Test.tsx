
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameMode } from '@/hooks/useGameMode';
import GameLayout from '@/components/practice/GameLayout';

const Test = () => {
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
    handleAnswer,
    startReviewMode,
    handleRemoveCardPrompt,
    restartPractice,
  } = useGameMode(id, 'test');
  
  const handleBackClick = () => {
    if (confirm('Are you sure you want to leave? Your progress will be lost.')) {
      navigate(`/deck/${id}`);
    }
  };

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
      mode="test"
      isReviewMode={isReviewMode}
      showRemovePrompt={showRemovePrompt}
      stats={stats}
      incorrectCards={incorrectCards}
      reviewCards={reviewCards}
      currentCycle={currentCycle}
      onAnswer={handleAnswer}
      onReviewMode={startReviewMode}
      onRemoveCardPrompt={handleRemoveCardPrompt}
      onRestartPractice={restartPractice}
      onBack={handleBackClick}
    />
  );
};

export default Test;
