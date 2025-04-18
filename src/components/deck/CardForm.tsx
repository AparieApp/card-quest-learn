
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Flashcard } from '@/types/deck';
import { Trash, Loader2, Plus, X } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';

const cardSchema = z.object({
  front_text: z.string().min(1, 'Question is required'),
  correct_answer: z.string().min(1, 'Correct answer is required'),
  manual_incorrect_answers: z.array(z.string()).max(3, 'Maximum 3 manual incorrect answers'),
});

type CardFormValues = z.infer<typeof cardSchema>;

interface CardFormProps {
  card?: Flashcard;
  onSubmit: (data: Omit<Flashcard, 'id' | 'created_at' | 'deck_id'>) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  isSubmitting?: boolean;
  existingAnswers?: string[];
}

const CardForm: React.FC<CardFormProps> = ({ 
  card, 
  onSubmit, 
  onCancel, 
  onDelete,
  isSubmitting = false,
  existingAnswers = []
}) => {
  const [manualAnswers, setManualAnswers] = useState<string[]>(
    card ? card.manual_incorrect_answers : []
  );

  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: card ? {
      front_text: card.front_text,
      correct_answer: card.correct_answer,
      manual_incorrect_answers: card.manual_incorrect_answers,
    } : {
      front_text: '',
      correct_answer: '',
      manual_incorrect_answers: [],
    },
  });

  const handleSubmit = (values: CardFormValues) => {
    onSubmit({
      front_text: values.front_text,
      correct_answer: values.correct_answer,
      manual_incorrect_answers: manualAnswers,
      incorrect_answers: [], // This will be populated from the pool when displaying
    });
  };

  const addManualAnswer = (answer: string) => {
    if (manualAnswers.length < 3 && answer.trim() && !manualAnswers.includes(answer.trim())) {
      setManualAnswers([...manualAnswers, answer.trim()]);
      form.setValue('manual_incorrect_answers', [...manualAnswers, answer.trim()]);
    }
  };

  const removeManualAnswer = (index: number) => {
    const newAnswers = manualAnswers.filter((_, i) => i !== index);
    setManualAnswers(newAnswers);
    form.setValue('manual_incorrect_answers', newAnswers);
  };

  const filteredExistingAnswers = existingAnswers.filter(
    answer => answer !== form.watch('correct_answer') && !manualAnswers.includes(answer)
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="front_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter the question or front side text"
                  className="min-h-20"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="correct_answer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correct Answer</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter the correct answer" 
                  {...field} 
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
                  onClick={() => removeManualAnswer(index)}
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
                  onSelect={addManualAnswer}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const input = document.querySelector('input[role="combobox"]') as HTMLInputElement;
                    if (input && input.value.trim()) {
                      addManualAnswer(input.value);
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
        
        <div className="flex justify-between pt-4">
          <div className="flex gap-2">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            {onDelete && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={onDelete}
                disabled={isSubmitting}
              >
                <Trash className="h-4 w-4 mr-1" /> Delete
              </Button>
            )}
          </div>
          <Button 
            type="submit" 
            className="bg-flashcard-primary hover:bg-flashcard-secondary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {card ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              card ? 'Update Card' : 'Add Card'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CardForm;
