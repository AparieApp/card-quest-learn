
import { Flashcard } from '@/types/deck';

export const CardMapper = {
  toDomain(dbCard: any): Flashcard {
    return {
      ...dbCard,
      manual_incorrect_answers: dbCard.manual_incorrect_answers || []
    };
  },
  
  toDomainList(dbCards: any[]): Flashcard[] {
    return dbCards.map(this.toDomain);
  }
};
