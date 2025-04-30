
import React from 'react';
import GameHeader from './GameHeader';
import ProgressBar from './ProgressBar';
import { Flashcard, Deck } from '@/types/deck';
import FlashcardDisplay from './FlashcardDisplay';
import { Loader2, Power, RefreshCw } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import SummaryView from './SummaryView';
import { Button } from '../ui/button';
import { toast } from 'sonner';

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
  shareCode?: string;
  currentCardStreak?: Record<string, number>;
  streakThreshold?: number;
  onAnswer: (isCorrect: boolean) => void;
  onReviewMode: () => void;
  onEndPractice?: () => void;
  onContinuePractice?: () => void;
  onEndReviewMode?: () => void;
  onRestartPractice?: () => void;
  onRemoveCardPrompt?: (shouldRemove: boolean) => void;
  onBack: () => void;
  onRefresh?: () => Promise<void>;
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
  shareCode,
  currentCardStreak = {},
  streakThreshold = 3,
  onAnswer,
  onReviewMode,
  onEndPractice,
  onContinuePractice,
  onEndReviewMode,
  onRestartPractice,
  onRemoveCardPrompt,
  onBack,
  onRefresh,
}: GameLayoutProps) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Handle manual refresh
  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (err) {
      console.error("Error during refresh:", err);
      toast.error("Failed to refresh deck");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading || !deck) {
    return (
      <Layout>
        <div className="container py-12 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-flashcard-primary" />
          <p className="mt-4 text-muted-foreground">Loading cards...</p>
          {onRefresh && (
            <Button 
              onClick={handleRefresh}
              variant="outline" 
              className="mt-6"
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Deck'}
            </Button>
          )}
        </div>
      </Layout>
    );
  }

  const cycleCards = isReviewMode ? reviewCards : deck.cards;
  const totalCardCount = cycleCards.length;
  
  // If we have a deck but no cards, show an error
  if (totalCardCount === 0) {
    return (
      <Layout>
        <div className="container py-12 flex flex-col items-center justify-center">
          <p className="text-red-500 font-semibold">No cards found in this deck.</p>
          <p className="mt-2 text-muted-foreground">This deck may be empty or cards failed to load.</p>
          {onRefresh && (
            <Button 
              onClick={handleRefresh}
              variant="outline" 
              className="mt-6"
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Deck'}
            </Button>
          )}
          <Button 
            onClick={onBack}
            variant="default" 
            className="mt-4"
          >
            Back to Deck
          </Button>
        </div>
      </Layout>
    );
  }
  
  // Calculate the current streak for the current card
  const currentCardId = currentCard?.id;
  const currentStreak = currentCardId ? (currentCardStreak[currentCardId] || 0) : 0;
  
  if (isReviewMode) {
    console.log(`GameLayout: Rendering Review Mode with ${totalCardCount} cards.`);
    if (currentCardId) {
      console.log(`Current card ${currentCardId} has streak: ${currentStreak}/${streakThreshold}`);
    }
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
            shareCode={shareCode}
          />
        ) : (
          <div className="flex flex-col items-center max-w-3xl mx-auto">
            <div className="w-full mb-8">
              <GameHeader
                title={deck.title}
                mode={`${isReviewMode ? 'Review' : mode.charAt(0).toUpperCase() + mode.slice(1)} Mode (Cycle ${currentCycle})`}
                onBack={onBack}
              />
              <ProgressBar currentIndex={currentCardIndex} total={totalCardCount} />
            </div>

            {/* Control buttons for Practice and Review modes */}
            <div className="w-full mb-6 flex justify-center gap-2">
              {mode === 'practice' && !isReviewMode && onEndPractice && (
                <Button 
                  onClick={onEndPractice}
                  variant="outline" 
                  className="bg-white border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Power className="mr-2 h-4 w-4" />
                  End Practice
                </Button>
              )}

              {mode === 'practice' && isReviewMode && onEndReviewMode && (
                <Button 
                  onClick={onEndReviewMode}
                  variant="outline" 
                  className="bg-white border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Power className="mr-2 h-4 w-4" />
                  End Review
                </Button>
              )}

              {onRefresh && (
                <Button 
                  onClick={handleRefresh}
                  variant="outline" 
                  className="bg-white"
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
              )}
            </div>

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
                currentStreak={currentStreak}
                streakThreshold={streakThreshold}
              />
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GameLayout;
