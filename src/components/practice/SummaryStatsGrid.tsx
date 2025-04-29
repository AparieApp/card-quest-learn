
import React from "react";
import SummaryStatsCard from "./SummaryStatsCard";

interface SummaryStatsGridProps {
  initialCorrect: number;
  initialCorrectPercent: number;
  totalCards: number;
  overallCorrect: number;
  overallCorrectPercent: number;
  overallAttempts: number;
  isTestMode: boolean;
}

const SummaryStatsGrid: React.FC<SummaryStatsGridProps> = ({
  initialCorrect,
  initialCorrectPercent,
  totalCards,
  overallCorrect,
  overallCorrectPercent,
  overallAttempts,
  isTestMode,
}) => {
  // For Practice mode, only show one card with "Accuracy" title
  // For Test mode, show both "Initial Accuracy" and "Overall Accuracy" cards
  return (
    <div className={`grid grid-cols-1 ${isTestMode ? "md:grid-cols-2" : ""} gap-4`}>
      {isTestMode && (
        <SummaryStatsCard
          title="Initial Accuracy"
          value={initialCorrectPercent}
          correct={initialCorrect}
          total={totalCards}
        />
      )}
      <SummaryStatsCard
        title={isTestMode ? "Overall Accuracy" : "Accuracy"}
        value={overallCorrectPercent}
        correct={overallCorrect}
        total={overallAttempts}
      />
    </div>
  );
};

export default SummaryStatsGrid;
