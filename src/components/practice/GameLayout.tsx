
import React from 'react';
import GameHeader from './GameHeader';
import ProgressBar from './ProgressBar';
import { Flashcard, Deck } from '@/types/deck';
import FlashcardDisplay from './FlashcardDisplay';
import { Loader2, Power } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import SummaryView from './SummaryView';
import { Button } from '../ui/button';

interface GameLayoutProps {
  isLoading: boolean;
  showSummary: boolean;
  deck: Deck | null;
  currentCard: Flashcard | null;
  currentCardIndex: number;
  totalCards: number;
  mode: 'practice' | 'test';
  isReviewMode: boolean;
  showRemovePrompt?: boolean;
  stats: {
    initialCorrect: number;
    overallCorrect: number;
    totalAttempts: number;
  };
  incorrectCards: Flashcard[];
  reviewCards?: Flashcard[];
  previousCycles?: Flashcard[];
  currentCycle: number;
  onAnswer: (isCorrect: boolean) => void;
  onReviewMode: () => void;
  onEndPractice?: () => void;
  onContinuePractice?: () => void;
  onEndReviewMode?: () => void;
  onRestartPractice?: () => void;
  onRemoveCardPrompt?: (shouldRemove: boolean) => void;
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
  showRemovePrompt = false,
  stats,
  incorrectCards,
  reviewCards = [],
  previousCycles = [],
  currentCycle,
  onAnswer,
  onReviewMode,
  onEndPractice,
  onContinuePractice,
  onEndReviewMode,
  onRestartPractice,
  onRemoveCardPrompt,
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

  // Compute the card pool for the current step (review pool vs full deck)
  const cycleCards = isReviewMode ? reviewCards : deck.cards;
  if (isReviewMode) {
    console.log(`GameLayout: Rendering Review Mode with ${cycleCards.length} cards.`);
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
            isTestMode={mode === 'test'}
            isReviewMode={isReviewMode}
            onReviewMode={onReviewMode}
            onContinuePractice={onContinuePractice}
            onRestartPractice={onRestartPractice}
          />
        ) : (
          <div className="flex flex-col items-center max-w-3xl mx-auto">
            <div className="w-full mb-8">
              <GameHeader
                title={deck.title}
                mode={`${isReviewMode ? 'Review' : mode.charAt(0).toUpperCase() + mode.slice(1)} Mode (Cycle ${currentCycle})`}
                onBack={onBack}
              />
              <ProgressBar currentIndex={currentCardIndex} total={totalCards} />
            </div>

            {/* Control buttons for Practice and Review modes */}
            {mode === 'practice' && !isReviewMode && onEndPractice && (
              <div className="w-full mb-6 flex justify-center">
                <Button 
                  onClick={onEndPractice}
                  variant="outline" 
                  className="bg-white border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Power className="mr-2 h-4 w-4" />
                  End Practice
                </Button>
              </div>
            )}

            {mode === 'practice' && isReviewMode && onEndReviewMode && (
              <div className="w-full mb-6 flex justify-center">
                <Button 
                  onClick={onEndReviewMode}
                  variant="outline" 
                  className="bg-white border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Power className="mr-2 h-4 w-4" />
                  End Review
                </Button>
              </div>
            )}

            {currentCard && (
              <FlashcardDisplay
                key={`${currentCard.id}-${currentCardIndex}-${showRemovePrompt}`}
                card={currentCard}
                deck={deck}
                cards={cycleCards}
                previousCycles={previousCycles}
                onAnswer={onAnswer}
                mode={mode}
                showRemovePrompt={showRemovePrompt}
                onRemoveCardPrompt={onRemoveCardPrompt}
              />
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GameLayout;
