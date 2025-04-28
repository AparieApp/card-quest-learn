
import { useState, useCallback } from 'react';
import { Flashcard } from '@/types/deck';
import { useDeck } from '@/context/DeckContext';
import { toast } from 'sonner';
import { handleError } from '@/utils/errorHandling';

export const useCardManager = (
  deckId: string,
  onOperationComplete?: () => void
) => {
  const { addCardToDeck, updateCard, deleteCard, refreshDecks, setThrottlingPaused, getDeck } = useDeck();
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [currentCard, setCurrentCard] = useState<Flashcard | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const performOperationAndRefresh = useCallback(async (operation: () => Promise<any>) => {
    setIsSubmitting(true);
    try {
      if (setThrottlingPaused) {
        setThrottlingPaused(true);
        console.log('Throttling paused for card operation');
      }
      
      await operation();
      console.log('Operation completed successfully, closing dialog');
      setIsCardDialogOpen(false);
      setCurrentCard(undefined);
      
      // Immediate refresh after operation, directly invoke parent handler
      if (onOperationComplete) {
        console.log('Calling operation complete callback immediately');
        await onOperationComplete();
      }
    } catch (error) {
      console.error('Operation failed:', error);
      handleError(error, 'Operation failed');
    } finally {
      setIsSubmitting(false);
      
      // Restore throttling after operation is complete
      if (setThrottlingPaused) {
        setTimeout(() => {
          setThrottlingPaused(false);
          console.log('Throttling restored after card operation');
        }, 500);
      }
    }
  }, [setThrottlingPaused, onOperationComplete]);

  const handleAddCard = useCallback(async (cardData: Omit<Flashcard, 'id' | 'created_at' | 'deck_id'>) => {
    console.log('Adding new card with data:', { ...cardData, deck_id: deckId });
    console.log('Manual incorrect answers being sent:', cardData.manual_incorrect_answers);
    
    await performOperationAndRefresh(async () => {
      const newCard = await addCardToDeck(deckId, {
        front_text: cardData.front_text,
        correct_answer: cardData.correct_answer,
        incorrect_answers: cardData.incorrect_answers || [],
        manual_incorrect_answers: cardData.manual_incorrect_answers || []
      });
      console.log('Card added successfully, received:', newCard);
      toast.success('Card added successfully!');
      return newCard;
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
      toast.success('Card updated successfully!');
    });
  }, [deckId, updateCard, currentCard, performOperationAndRefresh]);

  const handleDeleteCard = useCallback(async (cardId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this card?');
    if (!confirmDelete) return;
    
    console.log('Deleting card with ID:', cardId);
    
    await performOperationAndRefresh(async () => {
      await deleteCard(deckId, cardId);
      toast.success('Card deleted successfully!');
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
      toast.success('Card deleted successfully!');
    });
  }, [deckId, deleteCard, currentCard, performOperationAndRefresh]);

  const manualRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    console.log('Manual refresh requested from card manager');
    setIsRefreshing(true);
    
    try {
      if (setThrottlingPaused) {
        setThrottlingPaused(true);
        console.log('Throttling paused for manual refresh');
      }
      
      await refreshDecks(true);
      toast.success('Cards refreshed');
      
      if (onOperationComplete) {
        await onOperationComplete();
      }
    } catch (error) {
      console.error('Manual refresh failed:', error);
      toast.error('Failed to refresh cards');
    } finally {
      setIsRefreshing(false);
      
      if (setThrottlingPaused) {
        setTimeout(() => {
          setThrottlingPaused(false);
          console.log('Throttling restored after manual refresh');
        }, 500);
      }
    }
  }, [refreshDecks, onOperationComplete, isRefreshing, setThrottlingPaused]);

  return {
    isCardDialogOpen,
    setIsCardDialogOpen,
    currentCard,
    setCurrentCard,
    isSubmitting,
    isRefreshing,
    handleAddCard,
    handleUpdateCard,
    handleDeleteCard,
    handleDeleteCurrentCard,
    manualRefresh
  };
};
