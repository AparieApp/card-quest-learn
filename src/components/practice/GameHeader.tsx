
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface GameHeaderProps {
  title: string;
  mode: string;
  onBack: () => void;
}

const GameHeader = ({ title, mode, onBack }: GameHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Deck
      </Button>
      <div className="text-right">
        <h2 className="font-semibold text-xl">{title}</h2>
        <p className="text-sm text-muted-foreground">{mode}</p>
      </div>
    </div>
  );
};

export default GameHeader;
