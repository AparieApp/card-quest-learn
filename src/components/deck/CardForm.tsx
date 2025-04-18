
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Flashcard } from '@/types/deck';
import { Trash, Loader2 } from 'lucide-react';
import { CardFormTextInputs } from './card-form/CardFormTextInputs';
import { CardFormAnswers } from './card-form/CardFormAnswers';
import { cardSchema, CardFormValues } from './card-form/types';
import { handleError } from '@/utils/errorHandling';

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
    try {
      onSubmit({
        front_text: values.front_text,
        correct_answer: values.correct_answer,
        manual_incorrect_answers: manualAnswers,
        incorrect_answers: [], // This will be populated from the pool when displaying
      });
    } catch (error) {
      handleError(error, 'Failed to save card');
    }
  };

  const addManualAnswer = (answer: string) => {
    if (manualAnswers.length < 3 && answer.trim() && !manualAnswers.includes(answer.trim())) {
      const newAnswers = [...manualAnswers, answer.trim()];
      setManualAnswers(newAnswers);
      form.setValue('manual_incorrect_answers', newAnswers);
    }
  };

  const removeManualAnswer = (index: number) => {
    const newAnswers = manualAnswers.filter((_, i) => i !== index);
    setManualAnswers(newAnswers);
    form.setValue('manual_incorrect_answers', newAnswers);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <CardFormTextInputs form={form} isSubmitting={isSubmitting} />
        
        <CardFormAnswers
          manualAnswers={manualAnswers}
          existingAnswers={existingAnswers}
          isSubmitting={isSubmitting}
          correctAnswer={form.watch('correct_answer')}
          onAddAnswer={addManualAnswer}
          onRemoveAnswer={removeManualAnswer}
        />
        
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
