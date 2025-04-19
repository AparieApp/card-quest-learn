
import { useCallback } from 'react';
import { CreateCardInput, UpdateCardInput } from '@/types/deck';
import { DecksUpdater } from '@/types/cardOperations';
import { deckService } from '@/services/deckService';
import { toast } from 'sonner';
import { handleError } from '@/utils/errorHandling';

export const useCardMutations = (
  setDecks: DecksUpdater, 
  userId?: string, 
  onOperationComplete?: () => void
) => {
  const addCardToDeck = useCallback(async (deckId: string, card: CreateCardInput) => {
    if (!userId) {
      console.error('Cannot add card: User not authenticated');
      toast.error('You must be logged in to add cards');
      throw new Error('User not authenticated');
    }
    
    const optimisticCard = {
      id: crypto.randomUUID(),
      deck_id: deckId,
      created_at: new Date().toISOString(),
      ...card,
    };

    try {
      // Apply optimistic update
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
      
      // Update with real data
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
      if (onOperationComplete) onOperationComplete();
    } catch (error) {
      // Revert optimistic update on error
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
    }
  }, [userId, setDecks, onOperationComplete]);

  const updateCard = useCallback(async (deckId: string, cardId: string, cardData: UpdateCardInput) => {
    if (!userId) {
      console.error('Cannot update card: User not authenticated');
      toast.error('You must be logged in to update cards');
      throw new Error('User not authenticated');
    }

    try {
      // Apply optimistic update
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
      if (onOperationComplete) onOperationComplete();
    } catch (error) {
      // Revert optimistic update on error
      const originalDeck = await deckService.getDeck(deckId);
      if (originalDeck) {
        setDecks(prev => 
          prev.map(deck => 
            deck.id === deckId ? originalDeck : deck
          )
        );
      }
      handleError(error, 'Failed to update card');
    }
  }, [userId, setDecks, onOperationComplete]);

  const deleteCard = useCallback(async (deckId: string, cardId: string) => {
    if (!userId) {
      console.error('Cannot delete card: User not authenticated');
      toast.error('You must be logged in to delete cards');
      throw new Error('User not authenticated');
    }

    try {
      // Apply optimistic update
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
      if (onOperationComplete) onOperationComplete();
    } catch (error) {
      // Revert optimistic update on error
      const originalDeck = await deckService.getDeck(deckId);
      if (originalDeck) {
        setDecks(prev => 
          prev.map(deck => 
            deck.id === deckId ? originalDeck : deck
          )
        );
      }
      handleError(error, 'Failed to delete card');
    }
  }, [userId, setDecks, onOperationComplete]);

  return {
    addCardToDeck,
    updateCard,
    deleteCard
  };
};
