
import { useCallback } from 'react';
import { CreateCardInput, UpdateCardInput } from '@/types/deck';
import { DecksUpdater, OptimisticUpdateState } from '@/types/cardOperations';
import { deckService } from '@/services/deckService';
import { toast } from 'sonner';
import { handleError } from '@/utils/errorHandling';

export const useCardMutations = (
  setDecks: DecksUpdater, 
  userId?: string, 
  onOperationComplete?: () => void,
  optimisticState?: OptimisticUpdateState
) => {
  const addCardToDeck = useCallback(async (deckId: string, card: CreateCardInput) => {
    if (!userId) {
      console.error('Cannot add card: User not authenticated');
      toast.error('You must be logged in to add cards');
      throw new Error('User not authenticated');
    }
    
    console.log('Starting addCardToDeck operation with data:', card);
    console.log('Manual incorrect answers being sent:', card.manual_incorrect_answers);
    
    if (optimisticState) {
      optimisticState.setOptimisticUpdatingWithTimeout(true);
      optimisticState.setIsThrottlingPaused(true);
    }
    
    const optimisticCard = {
      id: crypto.randomUUID(),
      deck_id: deckId,
      created_at: new Date().toISOString(),
      ...card
    };

    try {
      // Immediately update UI with optimistic data
      console.log('Applying optimistic update with card:', optimisticCard);
      setDecks(prev => 
        prev.map(deck => 
          deck.id === deckId 
            ? { 
                ...deck, 
                cards: [...deck.cards, optimisticCard],
                updated_at: new Date().toISOString() 
              } 
            : deck
        )
      );

      // Save the card to the database
      console.log('Saving card to database with manual_incorrect_answers:', card.manual_incorrect_answers);
      
      // Make a deep copy of the card data to prevent any reference issues
      const cardToSave = {
        front_text: card.front_text,
        correct_answer: card.correct_answer,
        incorrect_answers: [...(card.incorrect_answers || [])],
        manual_incorrect_answers: [...(card.manual_incorrect_answers || [])]
      };
      
      console.log('Card data prepared for saving:', cardToSave);
      
      const newCard = await deckService.addCard(deckId, cardToSave);
      
      console.log('Card saved successfully:', newCard);
      console.log('Saved manual incorrect answers:', newCard.manual_incorrect_answers);
      
      // Update with real data from server
      setDecks(prev => 
        prev.map(deck => 
          deck.id === deckId 
            ? { 
                ...deck, 
                cards: deck.cards.map(c => 
                  c.id === optimisticCard.id ? newCard : c
                ),
                updated_at: new Date().toISOString()
              } 
            : deck
        )
      );

      toast.success('Card added successfully!');
      
      if (onOperationComplete) {
        console.log('Calling operation complete callback');
        await onOperationComplete();
      }

      return newCard;
    } catch (error) {
      console.error('Error adding card:', error);
      
      // Rollback optimistic update on error
      setDecks(prev => 
        prev.map(deck => 
          deck.id === deckId 
            ? { 
                ...deck, 
                cards: deck.cards.filter(c => c.id !== optimisticCard.id)
              } 
            : deck
        )
      );
      
      handleError(error, 'Failed to add card');
      throw error;
    } finally {
      if (optimisticState) {
        optimisticState.setOptimisticUpdatingWithTimeout(false);
        optimisticState.clearOptimisticTimeout();
        
        // Restore throttling after a small delay to ensure all operations complete
        setTimeout(() => {
          optimisticState.setIsThrottlingPaused(false);
          console.log('Throttling restored after card operation');
        }, 1000);
      }
    }
  }, [userId, setDecks, onOperationComplete, optimisticState]);

  const updateCard = useCallback(async (deckId: string, cardId: string, cardData: UpdateCardInput) => {
    if (!userId) {
      console.error('Cannot update card: User not authenticated');
      toast.error('You must be logged in to update cards');
      throw new Error('User not authenticated');
    }

    console.log('Starting updateCard operation:', { cardId, data: cardData });
    console.log('Manual incorrect answers being updated:', cardData.manual_incorrect_answers);

    if (optimisticState) {
      optimisticState.setOptimisticUpdatingWithTimeout(true);
      optimisticState.setIsThrottlingPaused(true);
    }

    try {
      // Optimistically update UI
      console.log('Applying optimistic update for card:', cardId);
      setDecks(prev => 
        prev.map(deck => 
          deck.id === deckId 
            ? { 
                ...deck, 
                cards: deck.cards.map(card => 
                  card.id === cardId 
                    ? { ...card, ...cardData }
                    : card
                ),
                updated_at: new Date().toISOString()
              } 
            : deck
        )
      );

      // Create a deep copy of the data to prevent reference issues
      const dataToSave = {
        ...(cardData.front_text !== undefined ? { front_text: cardData.front_text } : {}),
        ...(cardData.correct_answer !== undefined ? { correct_answer: cardData.correct_answer } : {}),
        ...(cardData.incorrect_answers !== undefined ? { incorrect_answers: [...cardData.incorrect_answers] } : {}),
        ...(cardData.manual_incorrect_answers !== undefined ? { manual_incorrect_answers: [...cardData.manual_incorrect_answers] } : {})
      };
      
      console.log('Card data prepared for update:', dataToSave);
      
      // Save to database
      await deckService.updateCard(cardId, dataToSave);
      
      console.log('Card updated successfully in database');
      toast.success('Card updated successfully!');
      
      if (onOperationComplete) {
        console.log('Calling operation complete callback');
        await onOperationComplete();
      }
    } catch (error) {
      console.error('Error updating card:', error);
      
      // Rollback on error by fetching the original deck
      try {
        const originalDeck = await deckService.getDeck(deckId);
        if (originalDeck) {
          setDecks(prev => 
            prev.map(deck => 
              deck.id === deckId ? originalDeck : deck
            )
          );
        }
      } catch (rollbackError) {
        console.error('Error rolling back deck state:', rollbackError);
      }
      
      handleError(error, 'Failed to update card');
    } finally {
      if (optimisticState) {
        optimisticState.setOptimisticUpdatingWithTimeout(false);
        optimisticState.clearOptimisticTimeout();
        
        // Restore throttling after a small delay
        setTimeout(() => {
          optimisticState.setIsThrottlingPaused(false);
          console.log('Throttling restored after card operation');
        }, 1000);
      }
    }
  }, [userId, setDecks, onOperationComplete, optimisticState]);

  const deleteCard = useCallback(async (deckId: string, cardId: string) => {
    if (!userId) {
      console.error('Cannot delete card: User not authenticated');
      toast.error('You must be logged in to delete cards');
      throw new Error('User not authenticated');
    }

    console.log('Starting deleteCard operation for card:', cardId);

    if (optimisticState) {
      optimisticState.setOptimisticUpdatingWithTimeout(true);
      optimisticState.setIsThrottlingPaused(true);
    }

    try {
      // Optimistically update UI
      console.log('Applying optimistic delete for card:', cardId);
      setDecks(prev => 
        prev.map(deck => 
          deck.id === deckId 
            ? { 
                ...deck, 
                cards: deck.cards.filter(card => card.id !== cardId),
                updated_at: new Date().toISOString()
              } 
            : deck
        )
      );

      // Delete from database
      await deckService.deleteCard(cardId);
      console.log('Card deleted successfully from database');
      
      toast.success('Card deleted successfully!');
      
      if (onOperationComplete) {
        console.log('Calling operation complete callback');
        await onOperationComplete();
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      
      // Rollback on error
      try {
        const originalDeck = await deckService.getDeck(deckId);
        if (originalDeck) {
          setDecks(prev => 
            prev.map(deck => 
              deck.id === deckId ? originalDeck : deck
            )
          );
        }
      } catch (rollbackError) {
        console.error('Error rolling back deck state:', rollbackError);
      }
      
      handleError(error, 'Failed to delete card');
    } finally {
      if (optimisticState) {
        optimisticState.setOptimisticUpdatingWithTimeout(false);
        optimisticState.clearOptimisticTimeout();
        
        // Restore throttling after a small delay
        setTimeout(() => {
          optimisticState.setIsThrottlingPaused(false);
          console.log('Throttling restored after card operation');
        }, 1000);
      }
    }
  }, [userId, setDecks, onOperationComplete, optimisticState]);

  return {
    addCardToDeck,
    updateCard,
    deleteCard
  };
};
