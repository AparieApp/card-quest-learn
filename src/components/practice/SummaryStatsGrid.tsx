
import React from "react";
import SummaryStatsCard from "./SummaryStatsCard";

interface SummaryStatsGridProps {
  initialCorrect: number;
  initialCorrectPercent: number;
  totalCards: number;
  overallCorrect: number;
  overallCorrectPercent: number;
  overallAttempts: number;
}

const SummaryStatsGrid: React.FC<SummaryStatsGridProps> = ({
  initialCorrect,
  initialCorrectPercent,
  totalCards,
  overallCorrect,
  overallCorrectPercent,
  overallAttempts,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SummaryStatsCard
        title="Initial Accuracy"
        value={initialCorrectPercent}
        correct={initialCorrect}
        total={totalCards}
      />
      <SummaryStatsCard
        title="Overall Accuracy"
        value={overallCorrectPercent}
        correct={overallCorrect}
        total={overallAttempts}
      />
    </div>
  );
};

export default SummaryStatsGrid;
