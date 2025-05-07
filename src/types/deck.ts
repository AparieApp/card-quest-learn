export interface Flashcard {
  id: string;
  deck_id: string;
  front_text: string;
  question_image_url?: string;
  correct_answer: string;
  incorrect_answers: string[];
  manual_incorrect_answers?: string[]; // Make this optional with ?
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

// Added for the Follow functionality
export interface FollowedDeck {
  id: string;
  user_id: string;
  deck_id: string;
  created_at: string;
  deck?: Deck;
}

export type CreateDeckInput = Pick<Deck, 'title' | 'description'>;
export type UpdateDeckInput = Pick<Deck, 'title' | 'description'>;
export type CreateCardInput = Pick<Flashcard, 'front_text' | 'question_image_url' | 'correct_answer' | 'incorrect_answers'> & {
  manual_incorrect_answers?: string[];
};
export type UpdateCardInput = Partial<Pick<Flashcard, 'front_text' | 'question_image_url' | 'correct_answer' | 'incorrect_answers'>> & {
  manual_incorrect_answers?: string[];
};
