
import { Flashcard } from '@/types/deck';

export const CardMapper = {
  toDomain(dbCard: any): Flashcard {
    return {
      id: dbCard.id,
      deck_id: dbCard.deck_id,
      front_text: dbCard.front_text,
      question_image_url: dbCard.question_image_url || undefined,
      question_type: dbCard.question_type || 'single-choice',
      correct_answer: dbCard.correct_answer || undefined,
      correct_answers: dbCard.correct_answers || undefined,
      incorrect_answers: dbCard.incorrect_answers || [],
      manual_incorrect_answers: dbCard.manual_incorrect_answers || [],
      created_at: dbCard.created_at
    };
  },
  
  toDomainList(dbCards: any[]): Flashcard[] {
    return dbCards.map(this.toDomain);
  }
};
