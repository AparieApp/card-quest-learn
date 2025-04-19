
import { Deck, Flashcard, CreateCardInput, UpdateCardInput } from './deck';

export type DecksUpdater = (updater: (prevDecks: Deck[]) => Deck[]) => void;

export interface OptimisticUpdateState {
  isOptimisticUpdating: boolean;
  setOptimisticUpdatingWithTimeout: (value: boolean) => void;
  clearOptimisticTimeout: () => void;
}

export interface CardMutationOperations {
  addCardToDeck: (deckId: string, card: CreateCardInput) => Promise<Flashcard>;  // Updated return type
  updateCard: (deckId: string, cardId: string, cardData: UpdateCardInput) => Promise<void>;
  deleteCard: (deckId: string, cardId: string) => Promise<void>;
}
