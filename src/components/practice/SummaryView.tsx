
import React from "react";
import SummaryHeader from "./SummaryHeader";
import SummaryStatsGrid from "./SummaryStatsGrid";
import SummaryIncorrectSection from "./SummaryIncorrectSection";
import SummaryActions from "./SummaryActions";
import { Flashcard } from "@/types/deck";

interface SummaryViewProps {
  deckId: string;
  initialCorrect: number;
  totalCards: number;
  overallCorrect: number;
  overallAttempts: number;
  incorrectCards: Flashcard[];
  isTestMode: boolean;
  isReviewMode?: boolean;
  onReviewMode: () => void;
  onContinuePractice?: () => void;
  onRestartPractice?: () => void;
}

const SummaryView: React.FC<SummaryViewProps> = ({
  deckId,
  initialCorrect,
  totalCards,
  overallCorrect,
  overallAttempts,
  incorrectCards,
  isTestMode,
  isReviewMode = false,
  onReviewMode,
  onContinuePractice,
  onRestartPractice,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-8">
      <SummaryHeader isReviewMode={isReviewMode} isTestMode={isTestMode} />
      <SummaryStatsGrid
        initialCorrect={initialCorrect}
        totalCards={totalCards}
        overallCorrect={overallCorrect}
        overallAttempts={overallAttempts}
      />
      <SummaryIncorrectSection incorrectCards={incorrectCards} />
      <SummaryActions
        deckId={deckId}
        incorrectCardsLength={incorrectCards.length}
        isTestMode={isTestMode}
        isReviewMode={isReviewMode}
        onReviewMode={onReviewMode}
        onContinuePractice={onContinuePractice}
        onRestartPractice={onRestartPractice}
      />
    </div>
  );
};

export default SummaryView;
