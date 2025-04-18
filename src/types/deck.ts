
export interface Flashcard {
  id: string;
  front_text: string;
  correct_answer: string;
  incorrect_answers: string[];
  created_at: string;
}

export interface Deck {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  cards: Flashcard[];
}

export type CreateDeckInput = Pick<Deck, 'title' | 'description'>;
export type UpdateDeckInput = Pick<Deck, 'title' | 'description'>;
export type CreateCardInput = Omit<Flashcard, 'id' | 'created_at'>;
export type UpdateCardInput = Partial<Omit<Flashcard, 'id' | 'created_at'>>;
