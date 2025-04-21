
import React from "react";
import SummaryStatsCard from "./SummaryStatsCard";
import SummaryIncorrectList from "./SummaryIncorrectList";
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
  const initialAccuracy =
    totalCards > 0 ? Math.round((initialCorrect / totalCards) * 100) : 0;
  const overallAccuracy =
    overallAttempts > 0
      ? Math.round((overallCorrect / overallAttempts) * 100)
      : 0;

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Summary</h1>
        <p className="text-muted-foreground">
          Your {isReviewMode ? "review" : isTestMode ? "test" : "practice"} results
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummaryStatsCard
          title="Initial Accuracy"
          value={initialAccuracy}
          correct={initialCorrect}
          total={totalCards}
        />
        <SummaryStatsCard
          title="Overall Accuracy"
          value={overallAccuracy}
          correct={overallCorrect}
          total={overallAttempts}
        />
      </div>
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          {incorrectCards.length > 0
            ? `Review These Cards (${incorrectCards.length})`
            : "Perfect Score! 🎉"}
        </h2>
        <SummaryIncorrectList incorrectCards={incorrectCards} />
      </div>
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
