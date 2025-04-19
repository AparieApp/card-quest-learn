
import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import CardForm from './CardForm';
import { Flashcard } from '@/types/deck';
import { Loader2 } from 'lucide-react';

interface CardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card?: Flashcard;
  onSubmit: (data: Omit<Flashcard, 'id' | 'created_at' | 'deck_id'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
  isSubmitting?: boolean;
}

const CardDialog: React.FC<CardDialogProps> = ({
  open,
  onOpenChange,
  card,
  onSubmit,
  onCancel,
  onDelete,
  isSubmitting = false,
}) => {
  // Close dialog automatically after successful submission
  useEffect(() => {
    if (!isSubmitting && open) {
      // This prevents closing during submission but allows for automatic close after
      console.log('Card dialog submission state change:', { isSubmitting });
    }
  }, [isSubmitting, open]);

  const handleSubmit = async (data: Omit<Flashcard, 'id' | 'created_at' | 'deck_id'>) => {
    console.log('Card form submitted with data:', data);
    console.log('Manual incorrect answers at dialog submission:', data.manual_incorrect_answers);
    await onSubmit(data);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (isSubmitting && !isOpen) {
          console.log('Preventing dialog close during submission');
          return;
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {card ? 'Edit Card' : 'Add New Card'}
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          </DialogTitle>
          <DialogDescription>
            {card ? 'Update the content of this card' : 'Create a new flashcard for your deck'}
          </DialogDescription>
        </DialogHeader>
        <CardForm
          card={card}
          onSubmit={handleSubmit}
          onCancel={onCancel}
          onDelete={onDelete}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CardDialog;
