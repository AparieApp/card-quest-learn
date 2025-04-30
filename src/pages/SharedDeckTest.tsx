
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSharedGameMode } from '@/hooks/useSharedGameMode';
import GameLayout from '@/components/practice/GameLayout';

const SharedDeckTest = () => {
  const { code } = useParams<{ code: string }>();
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
  } = useSharedGameMode(code, 'test');
  
  const handleBackClick = () => {
    if (confirm('Are you sure you want to leave? Your progress will be lost.')) {
      navigate(`/shared/${code}`);
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
      shareCode={code}
      onAnswer={handleAnswer}
      onReviewMode={startReviewMode}
      onRemoveCardPrompt={handleRemoveCardPrompt}
      onRestartPractice={restartPractice}
      onBack={handleBackClick}
    />
  );
};

export default SharedDeckTest;
