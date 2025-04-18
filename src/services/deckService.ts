
import { Deck, CreateDeckInput, UpdateDeckInput, CreateCardInput, UpdateCardInput, Flashcard } from '@/types/deck';
import { deckOperationsService } from './deckOperationsService';
import { cardOperationsService } from './cardOperationsService';
import { deckSharingService } from './deckSharingService';

// Re-export all services as a unified deckService
export const deckService = {
  // Deck Operations
  getDecks: deckOperationsService.getDecks,
  getDeck: deckOperationsService.getDeck,
  createDeck: deckOperationsService.createDeck,
  updateDeck: deckOperationsService.updateDeck,
  deleteDeck: deckOperationsService.deleteDeck,
  
  // Card Operations
  addCard: cardOperationsService.addCard,
  updateCard: cardOperationsService.updateCard,
  deleteCard: cardOperationsService.deleteCard,
  
  // Sharing Operations
  copyDeck: deckSharingService.copyDeck
};
