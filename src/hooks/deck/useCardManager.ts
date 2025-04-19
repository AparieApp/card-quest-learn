
import { useState, useCallback } from 'react';
import { Flashcard } from '@/types/deck';
import { useDeck } from '@/context/DeckContext';
import { toast } from 'sonner';
import { handleError } from '@/utils/errorHandling';

export const useCardManager = (
  deckId: string,
  onOperationComplete?: () => void
) => {
  const { addCardToDeck, updateCard, deleteCard, refreshDecks } = useDeck();
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [currentCard, setCurrentCard] = useState<Flashcard | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ensure reliable refresh after operation
  const performOperationAndRefresh = useCallback(async (operation: () => Promise<any>) => {
    setIsSubmitting(true);
    try {
      await operation();
      console.log('Operation completed successfully, closing dialog');
      setIsCardDialogOpen(false);
      setCurrentCard(undefined);
      
      // Wait a small delay to ensure the database operation completes
      setTimeout(async () => {
        console.log('Performing refresh after operation');
        await refreshDecks();
        
        if (onOperationComplete) {
          console.log('Calling operation complete callback from card manager');
          await onOperationComplete();
        }
      }, 300);
    } catch (error) {
      console.error('Operation failed:', error);
      handleError(error, 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  }, [refreshDecks, onOperationComplete]);

  const handleAddCard = useCallback(async (cardData: Omit<Flashcard, 'id' | 'created_at' | 'deck_id'>) => {
    console.log('Adding new card with data:', { ...cardData, deck_id: deckId });
    console.log('Manual incorrect answers being sent:', cardData.manual_incorrect_answers);
    
    await performOperationAndRefresh(async () => {
      await addCardToDeck(deckId, {
        front_text: cardData.front_text,
        correct_answer: cardData.correct_answer,
        incorrect_answers: cardData.incorrect_answers || [],
        manual_incorrect_answers: cardData.manual_incorrect_answers || []
      });
    });
  }, [deckId, addCardToDeck, performOperationAndRefresh]);

  const handleUpdateCard = useCallback(async (cardData: Omit<Flashcard, 'id' | 'created_at' | 'deck_id'>) => {
    if (!currentCard) {
      console.error('No current card to update');
      return;
    }
    
    console.log('Updating card with ID:', currentCard.id, 'and data:', cardData);
    console.log('Manual incorrect answers being updated:', cardData.manual_incorrect_answers);
    
    await performOperationAndRefresh(async () => {
      await updateCard(deckId, currentCard.id, cardData);
    });
  }, [deckId, updateCard, currentCard, performOperationAndRefresh]);

  const handleDeleteCard = useCallback(async (cardId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this card?');
    if (!confirmDelete) return;
    
    console.log('Deleting card with ID:', cardId);
    
    await performOperationAndRefresh(async () => {
      await deleteCard(deckId, cardId);
    });
  }, [deckId, deleteCard, performOperationAndRefresh]);

  const handleDeleteCurrentCard = useCallback(async () => {
    if (!currentCard) {
      console.error('No current card to delete');
      return;
    }
    
    console.log('Deleting current card with ID:', currentCard.id);
    
    await performOperationAndRefresh(async () => {
      await deleteCard(deckId, currentCard.id);
      toast.success('Card deleted successfully');
    });
  }, [deckId, deleteCard, currentCard, performOperationAndRefresh]);

  const openAddCardDialog = useCallback(() => {
    setCurrentCard(undefined);
    setIsCardDialogOpen(true);
  }, []);

  const openEditCardDialog = useCallback((card: Flashcard) => {
    console.log('Opening edit dialog for card:', card);
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
