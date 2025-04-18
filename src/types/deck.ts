
export interface Flashcard {
  id: string;
  deck_id: string;
  front_text: string;
  correct_answer: string;
  incorrect_answers: string[];
  manual_incorrect_answers: string[];
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
  flashcards?: Flashcard[]; // Used when fetching from Supabase
}

export type CreateDeckInput = Pick<Deck, 'title' | 'description'>;
export type UpdateDeckInput = Pick<Deck, 'title' | 'description'>;
export type CreateCardInput = Pick<Flashcard, 'front_text' | 'correct_answer' | 'incorrect_answers'>;
export type UpdateCardInput = Partial<Pick<Flashcard, 'front_text' | 'correct_answer' | 'incorrect_answers'>>;
