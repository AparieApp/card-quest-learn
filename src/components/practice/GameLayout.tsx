
import React from 'react';
import GameHeader from './GameHeader';
import ProgressBar from './ProgressBar';
import { Flashcard, Deck } from '@/types/deck';
import FlashcardDisplay from './FlashcardDisplay';
import { Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import SummaryView from './SummaryView';

interface GameLayoutProps {
  isLoading: boolean;
  showSummary: boolean;
  deck: Deck | null;
  currentCard: Flashcard | null;
  currentCardIndex: number;
  totalCards: number;
  mode: 'practice' | 'test';
  isReviewMode: boolean;
  stats: {
    initialCorrect: number;
    overallCorrect: number;
    totalAttempts: number;
  };
  incorrectCards: Flashcard[];
  onAnswer: (isCorrect: boolean) => void;
  onReviewMode: () => void;
  onBack: () => void;
}

const GameLayout = ({
  isLoading,
  showSummary,
  deck,
  currentCard,
  currentCardIndex,
  totalCards,
  mode,
  isReviewMode,
  stats,
  incorrectCards,
  onAnswer,
  onReviewMode,
  onBack,
}: GameLayoutProps) => {
  if (isLoading || !deck) {
    return (
      <Layout>
        <div className="container py-12 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-flashcard-primary" />
          <p className="mt-4 text-muted-foreground">Loading cards...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6">
        {showSummary ? (
          <SummaryView
            deckId={deck.id}
            initialCorrect={stats.initialCorrect}
            totalCards={totalCards}
            overallCorrect={stats.overallCorrect}
            overallAttempts={stats.totalAttempts}
            incorrectCards={incorrectCards}
            onReviewMode={onReviewMode}
          />
        ) : (
          <div className="flex flex-col items-center max-w-3xl mx-auto">
            <div className="w-full mb-8">
              <GameHeader
                title={deck.title}
                mode={`${isReviewMode ? 'Review' : mode.charAt(0).toUpperCase() + mode.slice(1)} Mode`}
                onBack={onBack}
              />
              <ProgressBar currentIndex={currentCardIndex} total={totalCards} />
            </div>
            
            {currentCard && (
              <FlashcardDisplay
                key={`${currentCard.id}-${currentCardIndex}`}
                card={currentCard}
                deck={deck}
                currentCycle={deck.cards}
                onAnswer={onAnswer}
                mode={mode}
              />
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GameLayout;
