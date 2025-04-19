
import React from 'react';
import { Form } from '@/components/ui/form';
import { Flashcard } from '@/types/deck';
import { CardFormTextInputs } from './card-form/CardFormTextInputs';
import { CardFormAnswers } from './card-form/CardFormAnswers';
import { FormActions } from './card-form/FormActions';
import { useCardForm } from '@/hooks/deck/useCardForm';

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
  const {
    form,
    manualAnswers,
    addManualAnswer,
    removeManualAnswer,
    handleSubmit
  } = useCardForm(card, onSubmit);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <CardFormTextInputs form={form} isSubmitting={isSubmitting} />
        
        <CardFormAnswers
          manualAnswers={manualAnswers}
          isSubmitting={isSubmitting}
          correctAnswer={form.watch('correct_answer')}
          onAddAnswer={addManualAnswer}
          onRemoveAnswer={removeManualAnswer}
        />
        
        <FormActions
          onCancel={onCancel}
          onDelete={onDelete}
          isSubmitting={isSubmitting}
          isEditMode={!!card}
        />
      </form>
    </Form>
  );
};

export default CardForm;
