
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  const handleSubmit = async (data: Omit<Flashcard, 'id' | 'created_at' | 'deck_id'>) => {
    await onSubmit(data);
    // Dialog will close automatically after submission due to isSubmitting state change
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (isSubmitting && !isOpen) return;
      onOpenChange(isOpen);
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {card ? 'Edit Card' : 'Add New Card'}
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          </DialogTitle>
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
