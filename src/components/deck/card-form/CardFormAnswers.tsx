
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormLabel } from '@/components/ui/form';
import { X, Plus, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CardFormAnswersProps {
  manualAnswers: string[];
  isSubmitting: boolean;
  correctAnswer: string;
  onAddAnswer: (answer: string) => void;
  onRemoveAnswer: (index: number) => void;
}

export const CardFormAnswers = ({
  manualAnswers,
  isSubmitting,
  correctAnswer,
  onAddAnswer,
  onRemoveAnswer,
}: CardFormAnswersProps) => {
  const [newAnswer, setNewAnswer] = React.useState('');

  const handleAddAnswer = () => {
    if (newAnswer.trim()) {
      onAddAnswer(newAnswer);
      setNewAnswer('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAnswer();
    }
  };

  React.useEffect(() => {
    console.log('Current manual answers in CardFormAnswers:', manualAnswers);
  }, [manualAnswers]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FormLabel>Incorrect Answers</FormLabel>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p>You can add up to 3 incorrect answers (optional)</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      <div className="space-y-2">
        {manualAnswers.map((answer, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input value={answer} disabled />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemoveAnswer(index)}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        {manualAnswers.length < 3 && (
          <div className="flex items-center gap-2">
            <Input
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type an incorrect answer"
              disabled={isSubmitting}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleAddAnswer}
              disabled={isSubmitting || manualAnswers.length >= 3 || !newAnswer.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
