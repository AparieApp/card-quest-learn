
import { useState, useCallback } from 'react';
import { Flashcard, CreateCardInput } from '@/types/deck';
import { useDeck } from '@/context/DeckContext';
import { toast } from 'sonner';
import { handleError } from '@/utils/errorHandling';

export const useCardManager = (
  deckId: string, 
  onOperationComplete?: () => Promise<void>
) => {
  const { addCardToDeck, updateCard, deleteCard } = useDeck();
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [currentCard, setCurrentCard] = useState<Flashcard | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCard = useCallback(async (cardData: Omit<Flashcard, 'id' | 'created_at' | 'deck_id'>) => {
    setIsSubmitting(true);
    try {
      console.log('Adding new card with data:', { ...cardData, deck_id: deckId });
      
      const cardInput: CreateCardInput = {
        front_text: cardData.front_text,
        correct_answer: cardData.correct_answer,
        incorrect_answers: cardData.incorrect_answers || [],
        manual_incorrect_answers: cardData.manual_incorrect_answers || []
      };
      
      await addCardToDeck(deckId, cardInput);
      if (onOperationComplete) await onOperationComplete();
      setIsCardDialogOpen(false);
      setCurrentCard(undefined);
    } catch (error) {
      console.error('Error adding card:', error);
      handleError(error, 'Failed to add card');
    } finally {
      setIsSubmitting(false);
    }
  }, [deckId, addCardToDeck, onOperationComplete]);

  const handleUpdateCard = useCallback(async (cardData: Omit<Flashcard, 'id' | 'created_at' | 'deck_id'>) => {
    if (!currentCard) {
      console.error('No current card to update');
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log('Updating card with ID:', currentCard.id, 'and data:', cardData);
      await updateCard(deckId, currentCard.id, cardData);
      if (onOperationComplete) await onOperationComplete();
      setIsCardDialogOpen(false);
      setCurrentCard(undefined);
    } catch (error) {
      console.error('Error updating card:', error);
      handleError(error, 'Failed to update card');
    } finally {
      setIsSubmitting(false);
    }
  }, [deckId, updateCard, currentCard, onOperationComplete]);

  const handleDeleteCard = useCallback(async (cardId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this card?');
    if (!confirmDelete) return;
    
    try {
      console.log('Deleting card with ID:', cardId);
      await deleteCard(deckId, cardId);
      if (onOperationComplete) await onOperationComplete();
    } catch (error) {
      console.error('Error deleting card:', error);
      handleError(error, 'Failed to delete card');
    }
  }, [deckId, deleteCard, onOperationComplete]);

  const handleDeleteCurrentCard = useCallback(async () => {
    if (!currentCard) {
      console.error('No current card to delete');
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log('Deleting current card with ID:', currentCard.id);
      await deleteCard(deckId, currentCard.id);
      if (onOperationComplete) await onOperationComplete();
      setIsCardDialogOpen(false);
      setCurrentCard(undefined);
      toast.success('Card deleted successfully');
    } catch (error) {
      console.error('Error deleting current card:', error);
      handleError(error, 'Failed to delete card');
    } finally {
      setIsSubmitting(false);
    }
  }, [deckId, deleteCard, currentCard, onOperationComplete]);

  const openAddCardDialog = useCallback(() => {
    setCurrentCard(undefined);
    setIsCardDialogOpen(true);
  }, []);

  const openEditCardDialog = useCallback((card: Flashcard) => {
    setCurrentCard(card);
    setIsCardDialogOpen(true);
  }, []);

  const closeCardDialog = useCallback(() => {
    setIsCardDialogOpen(false);
    setCurrentCard(undefined);
  }, []);

  return {
    isCardDialogOpen,
    setIsCardDialogOpen,
    currentCard,
    setCurrentCard,
    isSubmitting,
    handleAddCard,
    handleUpdateCard,
    handleDeleteCard,
    handleDeleteCurrentCard,
    openAddCardDialog,
    openEditCardDialog,
    closeCardDialog
  };
};
