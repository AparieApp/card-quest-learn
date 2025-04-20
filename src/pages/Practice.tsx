
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
    isReviewMode,
    showSummary,
    isLoading,
    stats,
    handleAnswer,
    startReviewMode,
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
      stats={stats}
      incorrectCards={incorrectCards}
      onAnswer={handleAnswer}
      onReviewMode={startReviewMode}
      onBack={handleBackClick}
    />
  );
};

export default Practice;
