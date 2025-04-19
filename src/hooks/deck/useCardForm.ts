
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
  // Initialize manual answers from provided card or empty array
  const initialManualAnswers = card?.manual_incorrect_answers || [];
  const [manualAnswers, setManualAnswers] = useState<string[]>(initialManualAnswers);

  console.log('Initializing card form with manual answers:', initialManualAnswers);

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
      console.log('Form submitted with values:', values);
      console.log('Current manual answers list:', manualAnswers);
      
      // Prepare the submission data with the current manual answers
      const submissionData = {
        front_text: values.front_text,
        correct_answer: values.correct_answer,
        manual_incorrect_answers: manualAnswers,
        incorrect_answers: [],
      };
      
      console.log('Submitting card with data:', submissionData);
      await onSubmit?.(submissionData);
    } catch (error) {
      handleError(error, 'Failed to save card');
    }
  };

  const addManualAnswer = (answer: string) => {
    if (manualAnswers.length < 3 && answer.trim() && !manualAnswers.includes(answer.trim())) {
      const newAnswers = [...manualAnswers, answer.trim()];
      console.log('Adding manual answer:', answer.trim());
      console.log('Updated manual answers list:', newAnswers);
      setManualAnswers(newAnswers);
      form.setValue('manual_incorrect_answers', newAnswers);
    }
  };

  const removeManualAnswer = (index: number) => {
    console.log('Removing manual answer at index:', index);
    const newAnswers = manualAnswers.filter((_, i) => i !== index);
    console.log('Updated manual answers list after removal:', newAnswers);
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
