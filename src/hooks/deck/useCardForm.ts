import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Flashcard } from '@/types/deck';
import { cardSchema, CardFormValues } from '@/components/deck/card-form/types';

export const useCardForm = (
  card?: Flashcard,
  onSubmit?: (data: Omit<Flashcard, 'id' | 'created_at' | 'deck_id'>) => void
) => {
  const [manualAnswers, setManualAnswers] = useState<string[]>([]);

  // Initialize form with default values
  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      front_text: card?.front_text || '',
      question_image_url: card?.question_image_url || '',
      correct_answer: card?.correct_answer || '',
      manual_incorrect_answers: []
    }
  });

  // Initialize manual answers from existing card if editing
  useEffect(() => {
    if (card?.manual_incorrect_answers && Array.isArray(card.manual_incorrect_answers)) {
      console.log('Initializing manual answers from card:', card.manual_incorrect_answers);
      setManualAnswers([...card.manual_incorrect_answers]);
    } else {
      console.log('Initializing card form with manual answers: []');
    }
  }, [card]);

  // Add a manual incorrect answer
  const addManualAnswer = (answer: string) => {
    if (manualAnswers.length >= 3) return;
    
    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer) return;
    
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
  const handleSubmit = (formData: CardFormValues) => {
    console.log('Form submitted with values:', formData);
    console.log('Current manual answers list:', manualAnswers);
    
    if (onSubmit) {
      const submissionData = {
        front_text: formData.front_text,
        question_image_url: formData.question_image_url,
        correct_answer: formData.correct_answer,
        incorrect_answers: [],
        manual_incorrect_answers: [...manualAnswers]
      };
      
      console.log('Submitting card with data:', submissionData);
      onSubmit(submissionData);
    }
  };

  return {
    form,
    manualAnswers,
    addManualAnswer,
    removeManualAnswer,
    handleSubmit
  };
};
