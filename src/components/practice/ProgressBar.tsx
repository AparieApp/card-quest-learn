
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  currentIndex: number;
  total: number;
}

const ProgressBar = ({ currentIndex, total }: ProgressBarProps) => {
  // Show 0% complete on first card, bar fills up as cards are completed
  const completedCards = Math.max(0, currentIndex);
  const progress = total === 0 ? 0 : Math.round((completedCards / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Card {currentIndex + 1} of {total}</span>
        <span>{progress}% complete</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};

export default ProgressBar;
