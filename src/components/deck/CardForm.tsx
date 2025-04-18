
import React from 'react';
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
import { Trash, Loader2 } from 'lucide-react';

const cardSchema = z.object({
  front_text: z.string().min(1, 'Question is required'),
  correct_answer: z.string().min(1, 'Correct answer is required'),
  incorrect_answers: z.array(z.string()).min(3, 'At least 3 incorrect answers are required'),
});

type CardFormValues = z.infer<typeof cardSchema>;

interface CardFormProps {
  card?: Flashcard;
  onSubmit: (data: Omit<Flashcard, 'id' | 'created_at' | 'deck_id'>) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  isSubmitting?: boolean;
}

const CardForm: React.FC<CardFormProps> = ({ 
  card, 
  onSubmit, 
  onCancel, 
  onDelete,
  isSubmitting = false 
}) => {
  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: card ? {
      front_text: card.front_text,
      correct_answer: card.correct_answer,
      incorrect_answers: card.incorrect_answers.length >= 3 
        ? card.incorrect_answers 
        : [...card.incorrect_answers, ...Array(3 - card.incorrect_answers.length).fill('')],
    } : {
      front_text: '',
      correct_answer: '',
      incorrect_answers: ['', '', ''],
    },
  });

  const handleSubmit = (values: CardFormValues) => {
    // Filter out any empty incorrect answers
    const filteredIncorrectAnswers = values.incorrect_answers.filter(answer => answer.trim() !== '');
    
    if (filteredIncorrectAnswers.length < 3) {
      form.setError('incorrect_answers', {
        type: 'manual',
        message: 'At least 3 incorrect answers are required',
      });
      return;
    }
    
    onSubmit({
      front_text: values.front_text,
      correct_answer: values.correct_answer,
      incorrect_answers: filteredIncorrectAnswers,
    });
  };

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
          <FormLabel>Incorrect Answers (at least 3)</FormLabel>
          {form.watch('incorrect_answers').map((_, index) => (
            <FormField
              key={index}
              control={form.control}
              name={`incorrect_answers.${index}`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      placeholder={`Incorrect answer ${index + 1}`} 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          ))}
          {form.formState.errors.incorrect_answers && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.incorrect_answers.message}
            </p>
          )}
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
