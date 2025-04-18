
import { Deck, CreateDeckInput, UpdateDeckInput, CreateCardInput, UpdateCardInput } from '@/types/deck';

export const deckService = {
  createDeck: (userId: string, input: CreateDeckInput): Deck => {
    const newDeck: Deck = {
      id: `deck_${Date.now()}`,
      creator_id: userId,
      title: input.title,
      description: input.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cards: [],
    };
    return newDeck;
  },

  updateDeck: (deck: Deck, input: UpdateDeckInput): Deck => {
    return {
      ...deck,
      title: input.title,
      description: input.description,
      updated_at: new Date().toISOString(),
    };
  },

  addCard: (deck: Deck, card: CreateCardInput): Deck => {
    const newCard = {
      id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      ...card,
    };

    return {
      ...deck,
      updated_at: new Date().toISOString(),
      cards: [...deck.cards, newCard],
    };
  },

  updateCard: (deck: Deck, cardId: string, cardData: UpdateCardInput): Deck => {
    return {
      ...deck,
      updated_at: new Date().toISOString(),
      cards: deck.cards.map(card => 
        card.id === cardId ? { ...card, ...cardData } : card
      ),
    };
  },

  deleteCard: (deck: Deck, cardId: string): Deck => {
    return {
      ...deck,
      updated_at: new Date().toISOString(),
      cards: deck.cards.filter(card => card.id !== cardId),
    };
  },

  copyDeck: (userId: string, sourceDeck: Deck): Deck => {
    return {
      ...sourceDeck,
      id: `deck_${Date.now()}_copy`,
      creator_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cards: sourceDeck.cards.map(card => ({
        ...card,
        id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      })),
    };
  },
};
