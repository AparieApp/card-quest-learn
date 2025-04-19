
import { useState } from 'react';
import { Deck, CreateCardInput, UpdateCardInput } from '@/types/deck';
import { deckService } from '@/services/deckService';
import { toast } from 'sonner';
import { handleError } from '@/utils/errorHandling';

export const useCardOperations = (
  setDecks: React.Dispatch<React.SetStateAction<Deck[]>>,
  userId?: string
) => {
  const [isOptimisticUpdating, setIsOptimisticUpdating] = useState(false);

  console.log('Card operation started with userId:', userId);

  const addCardToDeck = async (deckId: string, card: CreateCardInput) => {
    if (!userId) {
      console.error('Cannot add card: User not authenticated');
      throw new Error('User not authenticated');
    }
    
    setIsOptimisticUpdating(true);
    console.log('Adding card to deck:', deckId);
    
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

      console.log('Optimistic update applied, calling API');
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
      console.log('Card added successfully');
      toast.success('Card added successfully!');
    } catch (error) {
      console.error('Error adding card:', error);
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
      setIsOptimisticUpdating(false);
    }
  };

  const updateCard = async (deckId: string, cardId: string, cardData: UpdateCardInput) => {
    if (!userId) throw new Error('User not authenticated');
    
    setIsOptimisticUpdating(true);
    console.log('Updating card:', cardId);
    let previousState: Deck[] | null = null;
    
    try {
      setDecks(prev => {
        previousState = prev;
        return prev.map(deck => 
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
        );
      });

      await deckService.updateCard(cardId, cardData);
      console.log('Card updated successfully');
      toast.success('Card updated successfully!');
    } catch (error) {
      console.error('Error updating card:', error);
      if (previousState) {
        setDecks(previousState);
      }
      handleError(error, 'Failed to update card');
    } finally {
      setIsOptimisticUpdating(false);
    }
  };

  const deleteCard = async (deckId: string, cardId: string) => {
    if (!userId) throw new Error('User not authenticated');
    
    setIsOptimisticUpdating(true);
    console.log('Deleting card:', cardId);
    let previousState: Deck[] | null = null;
    
    try {
      setDecks(prev => {
        previousState = prev;
        return prev.map(deck => 
          deck.id === deckId 
            ? { 
                ...deck, 
                cards: deck.cards.filter(card => card.id !== cardId),
                updated_at: new Date().toISOString()
              } 
            : deck
        );
      });

      await deckService.deleteCard(cardId);
      console.log('Card deleted successfully');
      toast.success('Card deleted successfully!');
    } catch (error) {
      console.error('Error deleting card:', error);
      if (previousState) {
        setDecks(previousState);
      }
      handleError(error, 'Failed to delete card');
    } finally {
      setIsOptimisticUpdating(false);
    }
  };

  return {
    addCardToDeck,
    updateCard,
    deleteCard,
    isOptimisticUpdating
  };
};
