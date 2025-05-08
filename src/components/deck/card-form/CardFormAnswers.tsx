import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormLabel, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { X, Plus, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useFormContext } from 'react-hook-form'; // To access form methods
import { CardFormValues } from './types';

interface CardFormAnswersProps {
  // manualAnswers: string[]; // This will now be handled via form state for correct_answers too
  isSubmitting: boolean;
  // correctAnswer: string; // Replaced by form state
  // onAddAnswer: (answer: string) => void; // For manual incorrect, will adapt
  // onRemoveAnswer: (index: number) => void; // For manual incorrect, will adapt
}

export const CardFormAnswers = ({ isSubmitting }: CardFormAnswersProps) => {
  const { control, watch, setValue, getValues } = useFormContext<CardFormValues>();
  const questionType = watch('question_type');
  const correctAnswers = watch('correct_answers') || [];
  const manualIncorrectAnswers = watch('manual_incorrect_answers') || [];

  const [newManualIncorrect, setNewManualIncorrect] = useState('');
  const [newCorrectAnswer, setNewCorrectAnswer] = useState('');

  const handleToggleQuestionType = (isMultipleSelect: boolean) => {
    setValue('question_type', isMultipleSelect ? 'multiple-select' : 'single-choice');
    // Optionally clear the other type's answer fields when toggling
    if (isMultipleSelect) {
      setValue('correct_answer', '');
    } else {
      setValue('correct_answers', []);
    }
  };

  const addCorrectAnswer = () => {
    if (newCorrectAnswer.trim() && !correctAnswers.includes(newCorrectAnswer.trim())) {
      setValue('correct_answers', [...correctAnswers, newCorrectAnswer.trim()]);
      setNewCorrectAnswer('');
    }
  };

  const removeCorrectAnswer = (index: number) => {
    const updated = [...correctAnswers];
    updated.splice(index, 1);
    setValue('correct_answers', updated);
  };

  const addManualIncorrectAnswer = () => {
    if (newManualIncorrect.trim() && manualIncorrectAnswers.length < 3 && !manualIncorrectAnswers.includes(newManualIncorrect.trim())) {
      setValue('manual_incorrect_answers', [...manualIncorrectAnswers, newManualIncorrect.trim()]);
      setNewManualIncorrect('');
    }
  };

  const removeManualIncorrectAnswer = (index: number) => {
    const updated = [...manualIncorrectAnswers];
    updated.splice(index, 1);
    setValue('manual_incorrect_answers', updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Switch
          id="question-type-toggle"
          checked={questionType === 'multiple-select'}
          onCheckedChange={handleToggleQuestionType}
          disabled={isSubmitting}
        />
        <Label htmlFor="question-type-toggle">Allow multiple correct answers</Label>
      </div>

      {questionType === 'single-choice' ? (
        <FormField
          control={control}
          name="correct_answer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correct Answer</FormLabel>
              <FormControl>
                <Input placeholder="The one correct answer" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <div className="space-y-3">
          <FormLabel>Correct Answers (select all that apply)</FormLabel>
          {correctAnswers.map((answer, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input value={answer} readOnly disabled className="flex-grow" />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeCorrectAnswer(index)} disabled={isSubmitting}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {correctAnswers.length < 10 && ( // Arbitrary limit for UI sanity
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add a correct answer"
                value={newCorrectAnswer}
                onChange={(e) => setNewCorrectAnswer(e.target.value)}
                disabled={isSubmitting}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCorrectAnswer(); } }}
              />
              <Button type="button" onClick={addCorrectAnswer} disabled={isSubmitting || !newCorrectAnswer.trim()}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          )}
          <FormField control={control} name="correct_answers" render={() => <FormMessage />} /> 
        </div>
      )}

      {/* Manual Incorrect Answers Section (remains largely the same) */}
      <div className="space-y-3">
        <div className="flex items-center gap-1">
            <FormLabel>Optional: Add specific incorrect choices</FormLabel>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="max-w-xs">
                            Provide up to 3 specific wrong answers. 
                            If fewer than 3 are provided, or if none are, 
                            incorrect options will be auto-generated from other cards or variations.
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
        {manualIncorrectAnswers.map((answer, index) => (
          <div key={`incorrect-${index}`} className="flex items-center gap-2">
            <Input value={answer} readOnly disabled className="flex-grow" />
            <Button type="button" variant="ghost" size="icon" onClick={() => removeManualIncorrectAnswer(index)} disabled={isSubmitting}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {manualIncorrectAnswers.length < 3 && (
          <div className="flex items-center gap-2">
            <Input
              placeholder="Add a specific incorrect answer"
              value={newManualIncorrect}
              onChange={(e) => setNewManualIncorrect(e.target.value)}
              disabled={isSubmitting}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addManualIncorrectAnswer(); } }}
            />
            <Button type="button" onClick={addManualIncorrectAnswer} disabled={isSubmitting || !newManualIncorrect.trim() || manualIncorrectAnswers.length >= 3}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        )}
         <FormField control={control} name="manual_incorrect_answers" render={() => <FormMessage />} />
      </div>
    </div>
  );
};
