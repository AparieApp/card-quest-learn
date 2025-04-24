
import React from 'react';
import SummaryHeader from './SummaryHeader';
import SummaryStatsGrid from './SummaryStatsGrid';
import SummaryIncorrectSection from './SummaryIncorrectSection';
import SummaryActions from './SummaryActions';
import { Flashcard } from '@/types/deck';

interface SummaryViewProps {
  deckId: string;
  initialCorrect: number;
  totalCards: number;
  overallCorrect: number;
  overallAttempts: number;
  incorrectCards: Flashcard[];
  isTestMode: boolean;
  isReviewMode: boolean;
  onReviewMode: () => void;
  onContinuePractice?: () => void;
  onRestartPractice?: () => void;
  shareCode?: string;
}

const SummaryView: React.FC<SummaryViewProps> = ({
  deckId,
  initialCorrect,
  totalCards,
  overallCorrect,
  overallAttempts,
  incorrectCards,
  isTestMode,
  isReviewMode,
  onReviewMode,
  onContinuePractice,
  onRestartPractice,
  shareCode,
}) => {
  const initialCorrectPercent = totalCards > 0
    ? Math.round((initialCorrect / totalCards) * 100)
    : 0;
    
  const overallCorrectPercent = overallAttempts > 0
    ? Math.round((overallCorrect / overallAttempts) * 100)
    : 0;

  return (
    <div className="max-w-3xl mx-auto">
      <SummaryHeader 
        title={isReviewMode ? "Review Results" : "Session Complete!"} 
        subtitle={isTestMode ? "Test Mode" : "Practice Mode"} 
      />
      
      <div className="mt-8 mb-12">
        <SummaryStatsGrid
          initialCorrect={initialCorrect}
          initialCorrectPercent={initialCorrectPercent}
          totalCards={totalCards}
          overallCorrect={overallCorrect}
          overallCorrectPercent={overallCorrectPercent}
          overallAttempts={overallAttempts}
        />
      </div>
      
      {incorrectCards.length > 0 && (
        <div className="mb-12">
          <SummaryIncorrectSection incorrectCards={incorrectCards} />
        </div>
      )}
      
      <div className="mt-8">
        <SummaryActions
          deckId={deckId}
          incorrectCardsLength={incorrectCards.length}
          isTestMode={isTestMode}
          isReviewMode={isReviewMode}
          onReviewMode={onReviewMode}
          onContinuePractice={onContinuePractice}
          onRestartPractice={onRestartPractice}
          shareCode={shareCode}
        />
      </div>
    </div>
  );
};

export default SummaryView;
