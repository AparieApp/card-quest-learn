
import React from "react";
import { BarChart } from "lucide-react";

interface SummaryStatsCardProps {
  title: string;
  value: number;
  correct: number;
  total: number;
}

const SummaryStatsCard: React.FC<SummaryStatsCardProps> = ({
  title,
  value,
  correct,
  total,
}) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md flex flex-col items-center justify-center">
      <div className="text-flashcard-primary mb-2">
        <BarChart className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-4xl font-bold">{value}%</p>
      <p className="text-sm text-muted-foreground mt-2">
        {correct} of {total} {total === 1 ? "card" : "cards"} correct
      </p>
    </div>
  );
};

export default SummaryStatsCard;
