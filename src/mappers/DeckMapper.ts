
import { Deck } from '@/types/deck';
import { CardMapper } from './CardMapper';

export const DeckMapper = {
  toDomain(dbDeck: any): Deck {
    return {
      ...dbDeck,
      cards: (dbDeck.flashcards || []).map(CardMapper.toDomain)
    };
  },
  
  toDomainList(dbDecks: any[]): Deck[] {
    return dbDecks.map(this.toDomain);
  }
};
