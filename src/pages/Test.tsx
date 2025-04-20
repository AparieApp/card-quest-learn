
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

  return (
    <GameLayout
      isLoading={isLoading}
      showSummary={showSummary}
      deck={deck}
      currentCard={cards[currentCardIndex]}
      currentCardIndex={currentCardIndex}
      totalCards={cards.length}
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
