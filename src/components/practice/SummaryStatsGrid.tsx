
import React from "react";
import SummaryStatsCard from "./SummaryStatsCard";

interface SummaryStatsGridProps {
  initialCorrect: number;
  totalCards: number;
  overallCorrect: number;
  overallAttempts: number;
}

const SummaryStatsGrid: React.FC<SummaryStatsGridProps> = ({
  initialCorrect,
  totalCards,
  overallCorrect,
  overallAttempts,
}) => {
  const initialAccuracy =
    totalCards > 0 ? Math.round((initialCorrect / totalCards) * 100) : 0;
  const overallAccuracy =
    overallAttempts > 0 ? Math.round((overallCorrect / overallAttempts) * 100) : 0;

  return (
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
  );
};

export default SummaryStatsGrid;
