
import { useCallback } from 'react';
import { UpdateCardInput } from '@/types/deck';
import { DecksUpdater, OptimisticUpdateState } from '@/types/cardOperations';
import { deckService } from '@/services/deckService';
import { toast } from 'sonner';
import { handleError } from '@/utils/errorHandling';

export const useUpdateCard = (
  setDecks: DecksUpdater,
  userId?: string,
  onOperationComplete?: () => void,
  optimisticState?: OptimisticUpdateState
) => {
  return useCallback(async (deckId: string, cardId: string, cardData: UpdateCardInput) => {
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

      const dataToSave = {
        ...(cardData.front_text !== undefined ? { front_text: cardData.front_text } : {}),
        ...(cardData.correct_answer !== undefined ? { correct_answer: cardData.correct_answer } : {}),
        ...(cardData.incorrect_answers !== undefined ? { incorrect_answers: [...cardData.incorrect_answers] } : {}),
        ...(cardData.manual_incorrect_answers !== undefined ? { manual_incorrect_answers: [...cardData.manual_incorrect_answers] } : {})
      };
      
      await deckService.updateCard(cardId, dataToSave);
      
      toast.success('Card updated successfully!');
      
      if (onOperationComplete) {
        console.log('Calling operation complete callback');
        await onOperationComplete();
      }
    } catch (error) {
      console.error('Error updating card:', error);
      
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
        
        setTimeout(() => {
          optimisticState.setIsThrottlingPaused(false);
          console.log('Throttling restored after card operation');
        }, 1000);
      }
    }
  }, [userId, setDecks, onOperationComplete, optimisticState]);
};
