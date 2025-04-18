
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormLabel } from '@/components/ui/form';
import { X, Plus } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';

interface CardFormAnswersProps {
  manualAnswers: string[];
  existingAnswers: string[];
  isSubmitting: boolean;
  correctAnswer: string;
  onAddAnswer: (answer: string) => void;
  onRemoveAnswer: (index: number) => void;
}

export const CardFormAnswers = ({
  manualAnswers,
  existingAnswers,
  isSubmitting,
  correctAnswer,
  onAddAnswer,
  onRemoveAnswer,
}: CardFormAnswersProps) => {
  const filteredExistingAnswers = existingAnswers.filter(
    answer => answer !== correctAnswer && !manualAnswers.includes(answer)
  );

  return (
    <div className="space-y-4">
      <FormLabel>Incorrect Answers (up to 3)</FormLabel>
      
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
            <Combobox
              options={filteredExistingAnswers}
              emptyMessage="No matching answers"
              placeholder="Add an incorrect answer"
              onSelect={onAddAnswer}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                const input = document.querySelector('input[role="combobox"]') as HTMLInputElement;
                if (input && input.value.trim()) {
                  onAddAnswer(input.value);
                  input.value = '';
                }
              }}
              disabled={isSubmitting || manualAnswers.length >= 3}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
