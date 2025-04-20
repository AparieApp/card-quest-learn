
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  currentIndex: number;
  total: number;
}

const ProgressBar = ({ currentIndex, total }: ProgressBarProps) => {
  const progress = Math.round(((currentIndex + 1) / total) * 100);

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
