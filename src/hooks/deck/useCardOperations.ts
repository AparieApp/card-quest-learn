
import { Deck, CreateCardInput, UpdateCardInput } from '@/types/deck';
import { deckService } from '@/services/deckService';
import { toast } from 'sonner';

export const useCardOperations = (
  setDecks: React.Dispatch<React.SetStateAction<Deck[]>>,
  userId?: string
) => {
  const addCardToDeck = async (deckId: string, card: CreateCardInput) => {
    if (!userId) throw new Error('User not authenticated');
    
    // Optimistically update the UI
    const optimisticCard = {
      id: crypto.randomUUID(),
      deck_id: deckId,
      created_at: new Date().toISOString(),
      ...card,
    };

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

    try {
      const newCard = await deckService.addCard(deckId, card);
      // Update with real card data
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
      // Rollback on error
      setDecks(prev => 
        prev.map(deck => 
          deck.id === deckId 
            ? { 
                ...deck, 
                cards: deck.cards.filter(c => c.id !== optimisticCard.id),
                updated_at: new Date().toISOString()
              } 
            : deck
        )
      );
      toast.error('Failed to add card. Please try again.');
      throw error;
    }
  };

  const updateCard = async (deckId: string, cardId: string, cardData: UpdateCardInput) => {
    if (!userId) throw new Error('User not authenticated');
    
    // Store previous state for rollback
    let previousState: Deck[] | null = null;
    
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

    try {
      await deckService.updateCard(cardId, cardData);
      toast.success('Card updated successfully!');
    } catch (error) {
      // Rollback on error
      if (previousState) {
        setDecks(previousState);
      }
      toast.error('Failed to update card. Please try again.');
      throw error;
    }
  };

  const deleteCard = async (deckId: string, cardId: string) => {
    if (!userId) throw new Error('User not authenticated');
    
    // Store previous state for rollback
    let previousState: Deck[] | null = null;
    
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

    try {
      await deckService.deleteCard(cardId);
      toast.success('Card deleted successfully!');
    } catch (error) {
      // Rollback on error
      if (previousState) {
        setDecks(previousState);
      }
      toast.error('Failed to delete card. Please try again.');
      throw error;
    }
  };

  return {
    addCardToDeck,
    updateCard,
    deleteCard,
  };
};
