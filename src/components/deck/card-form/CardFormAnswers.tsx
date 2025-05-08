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
import { Badge } from "@/components/ui/badge";
import { useFormContext } from 'react-hook-form'; // To access form methods
import { CardFormValues } from './types';
import { Checkbox } from '@/components/ui/checkbox';

interface CardFormAnswersProps {
  isSubmitting: boolean;
  manualAnswers: string[];
  correctAnswer?: string;
  onAddAnswer: (answer: string) => void;
  onRemoveAnswer: (index: number) => void;
}

export const CardFormAnswers = ({ 
  isSubmitting, 
  manualAnswers, 
  correctAnswer,
  onAddAnswer,
  onRemoveAnswer 
}: CardFormAnswersProps) => {
  const { control, watch, setValue, getValues } = useFormContext<CardFormValues>();
  const questionType = watch('question_type');
  const correctAnswers = watch('correct_answers') || [];
  const manualIncorrectAnswers = watch('manual_incorrect_answers') || [];

  const [newManualIncorrect, setNewManualIncorrect] = useState('');
  const [newCorrectAnswer, setNewCorrectAnswer] = useState('');

  const handleToggleQuestionType = (isMultipleSelect: boolean) => {
    setValue('question_type', isMultipleSelect ? 'multiple-select' : 'single-choice', { shouldValidate: true });
    // Optionally clear the other type's answer fields when toggling
    if (isMultipleSelect) {
      setValue('correct_answer', '', { shouldValidate: true });
    } else {
      setValue('correct_answers', [], { shouldValidate: true });
    }
  };

  const addCorrectAnswer = () => {
    if (newCorrectAnswer.trim() && !correctAnswers.includes(newCorrectAnswer.trim())) {
      setValue('correct_answers', [...correctAnswers, newCorrectAnswer.trim()], { shouldValidate: true });
      setNewCorrectAnswer('');
    }
  };

  const removeCorrectAnswer = (index: number) => {
    const updated = [...correctAnswers];
    updated.splice(index, 1);
    setValue('correct_answers', updated, { shouldValidate: true });
  };

  const addManualIncorrectAnswer = () => {
    if (newManualIncorrect.trim() && manualIncorrectAnswers.length < 3 && !manualIncorrectAnswers.includes(newManualIncorrect.trim())) {
      setValue('manual_incorrect_answers', [...manualIncorrectAnswers, newManualIncorrect.trim()], { shouldValidate: true });
      setNewManualIncorrect('');
      // Also notify parent component through the prop
      onAddAnswer(newManualIncorrect.trim());
    }
  };

  const removeManualIncorrectAnswer = (index: number) => {
    const updated = [...manualIncorrectAnswers];
    updated.splice(index, 1);
    setValue('manual_incorrect_answers', updated, { shouldValidate: true });
    // Also notify parent component through the prop
    onRemoveAnswer(index);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
        <Switch
          id="question-type-toggle"
          checked={questionType === 'multiple-select'}
          onCheckedChange={handleToggleQuestionType}
          disabled={isSubmitting}
          className="data-[state=checked]:bg-blue-600"
        />
        <Label htmlFor="question-type-toggle" className="font-medium">
          {questionType === 'single-choice' 
            ? 'Single Choice Question' 
            : 'Multiple Choice Question'
          }
        </Label>
      </div>

      {questionType === 'single-choice' ? (
        <FormField
          control={control}
          name="correct_answer"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium text-lg">Correct Answer</FormLabel>
              <FormControl>
                <Input 
                  placeholder="The one correct answer" 
                  {...field} 
                  disabled={isSubmitting}
                  className="focus-visible:ring-blue-500" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <div className="space-y-3 border p-4 rounded-lg bg-card">
          <FormLabel className="font-medium text-lg">Correct Answers (select all that apply)</FormLabel>
          
          <div className="space-y-2 mb-4">
            {correctAnswers.map((answer, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                <Checkbox checked={true} className="border-blue-500" />
                <span className="flex-grow">{answer}</span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeCorrectAnswer(index)} 
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          {correctAnswers.length < 10 && (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add a correct answer"
                value={newCorrectAnswer}
                onChange={(e) => setNewCorrectAnswer(e.target.value)}
                disabled={isSubmitting}
                className="focus-visible:ring-blue-500"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCorrectAnswer(); } }}
              />
              <Button 
                type="button"
                variant="outline" 
                className="whitespace-nowrap"
                onClick={addCorrectAnswer} 
                disabled={isSubmitting || !newCorrectAnswer.trim()}
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          )}
          
          {correctAnswers.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              Please add at least one correct answer.
            </p>
          )}
          
          <FormField control={control} name="correct_answers" render={() => <FormMessage />} /> 
        </div>
      )}

      <div className="space-y-3 border p-4 rounded-lg bg-card">
        <div className="flex items-center gap-1">
          <FormLabel className="font-medium text-lg">Optional: Add specific incorrect choices</FormLabel>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3">
                <p>
                  Provide up to 3 specific wrong answers. 
                  If fewer than 3 are provided, or if none are, 
                  incorrect options will be auto-generated from other cards or variations.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="space-y-2 mb-4">
          {manualIncorrectAnswers.map((answer, index) => (
            <div key={`incorrect-${index}`} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Incorrect</Badge>
              <span className="flex-grow">{answer}</span>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive" 
                onClick={() => removeManualIncorrectAnswer(index)} 
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        
        {manualIncorrectAnswers.length < 3 && (
          <div className="flex items-center gap-2">
            <Input
              placeholder="Add a specific incorrect answer"
              value={newManualIncorrect}
              onChange={(e) => setNewManualIncorrect(e.target.value)}
              disabled={isSubmitting}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addManualIncorrectAnswer(); } }}
            />
            <Button 
              type="button" 
              variant="outline"
              className="whitespace-nowrap" 
              onClick={addManualIncorrectAnswer} 
              disabled={isSubmitting || !newManualIncorrect.trim() || manualIncorrectAnswers.length >= 3}
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        )}
        
        {manualIncorrectAnswers.length === 0 && (
          <p className="text-sm text-muted-foreground italic">
            You can add up to 3 specific incorrect answers (optional).
          </p>
        )}
        
        <FormField control={control} name="manual_incorrect_answers" render={() => <FormMessage />} />
      </div>
    </div>
  );
};
