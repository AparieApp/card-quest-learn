import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Flashcard, CreateCardInput } from '@/types/deck';
import { cardSchema, CardFormValues } from '@/components/deck/card-form/types';

export const useCardForm = (
  card?: Flashcard,
  onSubmit?: (data: Omit<Flashcard, 'id' | 'created_at' | 'deck_id'>) => void
) => {
  const [manualAnswers, setManualAnswers] = useState<string[]>(card?.manual_incorrect_answers || []);

  // Initialize form with default values
  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      front_text: card?.front_text || '',
      question_image_url: card?.question_image_url || '',
      question_type: card?.question_type || 'single-choice',
      correct_answer: card?.correct_answer || '',
      correct_answers: card?.correct_answers || [],
      manual_incorrect_answers: card?.manual_incorrect_answers || [] // Keep this for manual incorrect answers UI
    }
  });

  // Reset form if card changes (e.g. when dialog opens for edit vs add)
  useEffect(() => {
    if (card) {
      form.reset({
        front_text: card.front_text || '',
        question_image_url: card.question_image_url || '',
        question_type: card.question_type || 'single-choice',
        correct_answer: card.correct_answer || '',
        correct_answers: card.correct_answers || [],
        manual_incorrect_answers: card.manual_incorrect_answers || []
      });
      setManualAnswers(card.manual_incorrect_answers || []);
    } else {
      form.reset({
        front_text: '',
        question_image_url: '',
        question_type: 'single-choice',
        correct_answer: '',
        correct_answers: [],
        manual_incorrect_answers: []
      });
      setManualAnswers([]);
    }
  }, [card, form.reset]);

  // Add a manual incorrect answer
  const addManualAnswer = (answer: string) => {
    if (manualAnswers.length >= 3) {
      return;
    }
    
    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer) {
      return;
    }
    
    // Check for duplicates
    if (manualAnswers.includes(trimmedAnswer)) {
      return;
    }
    
    console.log('Adding manual answer:', trimmedAnswer);
    setManualAnswers(prev => {
      const newAnswers = [...prev, trimmedAnswer];
      console.log('Updated manual answers list:', newAnswers);
      return newAnswers;
    });
  };

  // Remove a manual incorrect answer
  const removeManualAnswer = (index: number) => {
    setManualAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers.splice(index, 1);
      console.log('Removed answer at index', index, 'new list:', newAnswers);
      return newAnswers;
    });
  };

  // Handle form submission
  const handleSubmit = (values: CardFormValues) => {
    if (!onSubmit) return;

    const submissionData: CreateCardInput = {
      front_text: values.front_text,
      question_image_url: values.question_image_url,
      question_type: values.question_type,
      incorrect_answers: [], // This is usually auto-generated, or could be part of form if needed
      manual_incorrect_answers: manualAnswers, // Use the state variable for manual answers
    };

    if (values.question_type === 'single-choice') {
      submissionData.correct_answer = values.correct_answer;
      submissionData.correct_answers = undefined; // Ensure it's not set
    } else {
      submissionData.correct_answers = values.correct_answers;
      submissionData.correct_answer = undefined; // Ensure it's not set
    }
    
    console.log('Submitting card form with values:', submissionData);
    // The onSubmit prop expects Omit<Flashcard, 'id' | 'created_at' | 'deck_id'>
    // which CreateCardInput should satisfy if Flashcard type is aligned.
    onSubmit(submissionData as Omit<Flashcard, 'id' | 'created_at' | 'deck_id'>);
  };

  return {
    form,
    manualAnswers,
    addManualAnswer,
    removeManualAnswer,
    handleSubmit
  };
};
