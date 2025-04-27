
import { useCallback } from 'react';
import { DecksUpdater, OptimisticUpdateState } from '@/types/cardOperations';
import { deckService } from '@/services/deckService';
import { toast } from 'sonner';
import { handleError } from '@/utils/errorHandling';

export const useDeleteCard = (
  setDecks: DecksUpdater,
  userId?: string,
  onOperationComplete?: () => void,
  optimisticState?: OptimisticUpdateState
) => {
  return useCallback(async (deckId: string, cardId: string) => {
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
      // Optimistic update - remove card from UI
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
      
      // Trigger refresh after operation completes
      if (onOperationComplete) {
        console.log('Calling operation complete callback');
        await onOperationComplete();
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      
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
      
      handleError(error, 'Failed to delete card');
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
