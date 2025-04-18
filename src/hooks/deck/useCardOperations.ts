
import { Deck, CreateCardInput, UpdateCardInput } from '@/types/deck';
import { deckService } from '@/services/deckService';
import { toast } from 'sonner';

export const useCardOperations = (
  setDecks: React.Dispatch<React.SetStateAction<Deck[]>>,
  userId?: string
) => {
  const addCardToDeck = async (deckId: string, card: CreateCardInput) => {
    if (!userId) throw new Error('User not authenticated');
    
    const newCard = await deckService.addCard(deckId, card);
    setDecks(prev => 
      prev.map(deck => 
        deck.id === deckId 
          ? { ...deck, cards: [...deck.cards, newCard], updated_at: new Date().toISOString() } 
          : deck
      )
    );
    toast.success('Card added!');
  };

  const updateCard = async (deckId: string, cardId: string, cardData: UpdateCardInput) => {
    if (!userId) throw new Error('User not authenticated');
    
    await deckService.updateCard(cardId, cardData);
    setDecks(prev => 
      prev.map(deck => 
        deck.id === deckId 
          ? { 
              ...deck, 
              updated_at: new Date().toISOString(),
              cards: deck.cards.map(card => 
                card.id === cardId ? { ...card, ...cardData } : card
              ) 
            } 
          : deck
      )
    );
    toast.success('Card updated!');
  };

  const deleteCard = async (deckId: string, cardId: string) => {
    if (!userId) throw new Error('User not authenticated');
    
    await deckService.deleteCard(cardId);
    setDecks(prev => 
      prev.map(deck => 
        deck.id === deckId 
          ? { 
              ...deck, 
              updated_at: new Date().toISOString(),
              cards: deck.cards.filter(card => card.id !== cardId) 
            } 
          : deck
      )
    );
    toast.success('Card deleted!');
  };

  return {
    addCardToDeck,
    updateCard,
    deleteCard,
  };
};
