import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useAuth } from '@/context/auth';
import { Deck, CreateDeckInput, UpdateDeckInput, CreateCardInput, UpdateCardInput, Flashcard } from '@/types/deck';
import { useDeckStorage } from '@/hooks/useDeckStorage';
import { useFavorites } from '@/hooks/useFavorites';
import { useDeckOperations } from '@/hooks/deck/useDeckOperations';
import { useCardOperations } from '@/hooks/deck/useCardOperations';
import { useSharingOperations } from '@/hooks/deck/useSharingOperations';
import { deckService } from '@/services/deckService';

interface DeckContextType {
  decks: Deck[];
  favorites: string[];
  loading: boolean;
  createDeck: (input: CreateDeckInput) => Promise<Deck>;
  updateDeck: (id: string, input: UpdateDeckInput) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
  getDeck: (id: string) => Deck | null;
  addCardToDeck: (deckId: string, card: CreateCardInput) => Promise<Flashcard>;
  updateCard: (deckId: string, cardId: string, cardData: UpdateCardInput) => Promise<void>;
  deleteCard: (deckId: string, cardId: string) => Promise<void>;
  toggleFavorite: (deckId: string) => Promise<void>;
  isFavorite: (deckId: string) => boolean;
  getDeckByShareCode: (code: string) => Promise<Deck | null>;
  generateShareCode: (deckId: string) => string;
  copyDeck: (deckId: string) => Promise<Deck>;
  refreshDecks: () => Promise<void>;
  isOptimisticUpdating: boolean;
}

const DeckContext = createContext<DeckContextType>({
  decks: [],
  favorites: [],
  loading: true,
  createDeck: async () => ({ id: '', title: '', description: '', creator_id: '', created_at: '', updated_at: '', cards: [] }),
  updateDeck: async () => {},
  deleteDeck: async () => {},
  getDeck: () => null,
  addCardToDeck: async () => ({ id: '', deck_id: '', front_text: '', correct_answer: '', incorrect_answers: [], created_at: '' }),
  updateCard: async () => {},
  deleteCard: async () => {},
  toggleFavorite: async () => {},
  isFavorite: () => false,
  getDeckByShareCode: async () => null,
  generateShareCode: () => '',
  copyDeck: async () => ({ id: '', title: '', description: '', creator_id: '', created_at: '', updated_at: '', cards: [] }),
  refreshDecks: async () => {},
  isOptimisticUpdating: false,
});

export const DeckProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { decks = [], loading, setDecks, refreshDecks: refreshStoredDecks } = useDeckStorage();
  const { favorites = [], toggleFavorite, isFavorite } = useFavorites();
  
  const userId = user?.id;
  
  const {
    createDeck,
    updateDeck,
    deleteDeck,
  } = useDeckOperations(setDecks, userId);

  const handleDecksUpdate = useCallback((updater: (prevDecks: Deck[]) => Deck[]) => {
    setDecks(updater);
  }, [setDecks]);

  const refreshDecks = useCallback(async () => {
    console.log('Refreshing decks with user ID:', userId);
    if (!userId) {
      console.log('Cannot refresh decks: User not authenticated');
      return;
    }
    
    try {
      await refreshStoredDecks();
    } catch (error) {
      console.error('Error refreshing decks:', error);
    }
  }, [userId, refreshStoredDecks]);

  const {
    addCardToDeck,
    updateCard,
    deleteCard,
    isOptimisticUpdating
  } = useCardOperations(handleDecksUpdate, userId, refreshDecks);

  const {
    getDeckByShareCode,
    generateShareCode,
    copyDeck,
  } = useSharingOperations(decks, setDecks, userId);
  
  const getDeck = useCallback((id: string): Deck | null => {
    if (!id) return null;
    return Array.isArray(decks) ? decks.find(deck => deck.id === id) || null : null;
  }, [decks]);

  const contextValue = {
    decks: Array.isArray(decks) ? decks : [],
    favorites: Array.isArray(favorites) ? favorites : [],
    loading,
    createDeck,
    updateDeck,
    deleteDeck,
    getDeck,
    addCardToDeck,
    updateCard,
    deleteCard,
    toggleFavorite,
    isFavorite,
    getDeckByShareCode,
    generateShareCode,
    copyDeck,
    refreshDecks,
    isOptimisticUpdating,
  };

  return (
    <DeckContext.Provider value={contextValue}>
      {children}
    </DeckContext.Provider>
  );
};

export const useDeck = () => useContext(DeckContext);
