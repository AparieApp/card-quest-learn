
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Flashcard } from '@/types/deck';
import { cardSchema, CardFormValues } from '@/components/deck/card-form/types';
import { handleError } from '@/utils/errorHandling';
import { toast } from 'sonner';

export const useCardForm = (
  card?: Flashcard,
  onSubmit?: (data: Omit<Flashcard, 'id' | 'created_at' | 'deck_id'>) => void
) => {
  const [manualAnswers, setManualAnswers] = useState<string[]>(
    card ? card.manual_incorrect_answers || [] : []
  );

  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: card ? {
      front_text: card.front_text,
      correct_answer: card.correct_answer,
      manual_incorrect_answers: card.manual_incorrect_answers || [],
    } : {
      front_text: '',
      correct_answer: '',
      manual_incorrect_answers: [],
    },
  });

  const handleSubmit = async (values: CardFormValues) => {
    try {
      await onSubmit?.({
        front_text: values.front_text,
        correct_answer: values.correct_answer,
        manual_incorrect_answers: manualAnswers,
        incorrect_answers: [],
      });
      toast.success(card ? 'Card updated successfully' : 'Card added successfully');
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

  return {
    form,
    manualAnswers,
    addManualAnswer,
    removeManualAnswer,
    handleSubmit,
  };
};
