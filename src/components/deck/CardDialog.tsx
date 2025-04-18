
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CardForm from './CardForm';
import { Flashcard } from '@/types/deck';

interface CardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card?: Flashcard;
  onSubmit: (data: Omit<Flashcard, 'id' | 'created_at'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const CardDialog: React.FC<CardDialogProps> = ({
  open,
  onOpenChange,
  card,
  onSubmit,
  onCancel,
  onDelete,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{card ? 'Edit Card' : 'Add New Card'}</DialogTitle>
        </DialogHeader>
        <CardForm
          card={card}
          onSubmit={onSubmit}
          onCancel={onCancel}
          onDelete={onDelete}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CardDialog;
