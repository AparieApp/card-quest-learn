
import { useState, useCallback } from 'react';
import { Flashcard } from '@/types/deck';
import { useDeck } from '@/context/DeckContext';
import { toast } from 'sonner';
import { handleError } from '@/utils/errorHandling';

export const useCardManager = (
  deckId: string,
  onOperationComplete?: () => void
) => {
  const { addCardToDeck, updateCard, deleteCard, refreshDecks, setThrottlingPaused } = useDeck();
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [currentCard, setCurrentCard] = useState<Flashcard | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Ensure reliable refresh after operation
  const performOperationAndRefresh = useCallback(async (operation: () => Promise<any>) => {
    setIsSubmitting(true);
    try {
      // Disable throttling before operation
      if (setThrottlingPaused) {
        setThrottlingPaused(true);
      }
      
      await operation();
      console.log('Operation completed successfully, closing dialog');
      setIsCardDialogOpen(false);
      setCurrentCard(undefined);
      
      // Allow a small delay to ensure the database operation completes
      setTimeout(async () => {
        console.log('Performing refresh after operation with throttling disabled');
        setIsRefreshing(true);
        
        try {
          await refreshDecks(true); // Pass true to bypass throttle
          
          if (onOperationComplete) {
            console.log('Calling operation complete callback from card manager');
            await onOperationComplete();
          }
        } catch (refreshError) {
          console.error('Error during refresh:', refreshError);
        } finally {
          setIsRefreshing(false);
          
          // Re-enable throttling after all operations complete
          if (setThrottlingPaused) {
            setTimeout(() => {
              setThrottlingPaused(false);
              console.log('Throttling restored after all operations');
            }, 500);
          }
        }
      }, 300);
    } catch (error) {
      console.error('Operation failed:', error);
      handleError(error, 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  }, [refreshDecks, onOperationComplete, setThrottlingPaused]);

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

  const manualRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    console.log('Manual refresh requested from card manager');
    setIsRefreshing(true);
    
    try {
      if (setThrottlingPaused) {
        setThrottlingPaused(true);
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
        }, 500);
      }
    }
  }, [refreshDecks, onOperationComplete, isRefreshing, setThrottlingPaused]);

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
    isRefreshing,
    handleAddCard,
    handleUpdateCard,
    handleDeleteCard,
    handleDeleteCurrentCard,
    openAddCardDialog,
    openEditCardDialog,
    closeCardDialog,
    manualRefresh
  };
};
