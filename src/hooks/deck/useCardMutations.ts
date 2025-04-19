
import { useCallback } from 'react';
import { CreateCardInput, UpdateCardInput } from '@/types/deck';
import { DecksUpdater } from '@/types/cardOperations';
import { deckService } from '@/services/deckService';
import { toast } from 'sonner';
import { handleError } from '@/utils/errorHandling';
import { useOptimisticUpdates } from './useOptimisticUpdates';

export const useCardMutations = (setDecks: DecksUpdater, userId?: string) => {
  const { 
    isOptimisticUpdating, 
    setOptimisticUpdatingWithTimeout, 
    clearOptimisticTimeout 
  } = useOptimisticUpdates();

  const addCardToDeck = useCallback(async (deckId: string, card: CreateCardInput) => {
    if (!userId) {
      console.error('Cannot add card: User not authenticated');
      toast.error('You must be logged in to add cards');
      throw new Error('User not authenticated');
    }
    
    setOptimisticUpdatingWithTimeout(true);
    
    const optimisticCard = {
      id: crypto.randomUUID(),
      deck_id: deckId,
      created_at: new Date().toISOString(),
      ...card,
    };

    try {
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

      const newCard = await deckService.addCard(deckId, card);
      
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
    } catch (error) {
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
    } finally {
      clearOptimisticTimeout();
      setOptimisticUpdatingWithTimeout(false);
    }
  }, [userId, setDecks, setOptimisticUpdatingWithTimeout, clearOptimisticTimeout]);

  const updateCard = useCallback(async (deckId: string, cardId: string, cardData: UpdateCardInput) => {
    if (!userId) {
      console.error('Cannot update card: User not authenticated');
      toast.error('You must be logged in to update cards');
      throw new Error('User not authenticated');
    }
    
    setOptimisticUpdatingWithTimeout(true);
    const originalDeckState = [...(await deckService.getDecks())];
    
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

      await deckService.updateCard(cardId, cardData);
      toast.success('Card updated successfully!');
    } catch (error) {
      setDecks(() => originalDeckState);
      handleError(error, 'Failed to update card');
    } finally {
      clearOptimisticTimeout();
      setOptimisticUpdatingWithTimeout(false);
    }
  }, [userId, setDecks, setOptimisticUpdatingWithTimeout, clearOptimisticTimeout]);

  const deleteCard = useCallback(async (deckId: string, cardId: string) => {
    if (!userId) {
      console.error('Cannot delete card: User not authenticated');
      toast.error('You must be logged in to delete cards');
      throw new Error('User not authenticated');
    }
    
    setOptimisticUpdatingWithTimeout(true);
    const originalDeckState = [...(await deckService.getDecks())];
    
    try {
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

      await deckService.deleteCard(cardId);
      toast.success('Card deleted successfully!');
    } catch (error) {
      setDecks(() => originalDeckState);
      handleError(error, 'Failed to delete card');
    } finally {
      clearOptimisticTimeout();
      setOptimisticUpdatingWithTimeout(false);
    }
  }, [userId, setDecks, setOptimisticUpdatingWithTimeout, clearOptimisticTimeout]);

  return {
    addCardToDeck,
    updateCard,
    deleteCard,
    isOptimisticUpdating
  };
};
