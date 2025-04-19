
import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useAuth } from '@/context/auth';
import { Deck, CreateDeckInput, UpdateDeckInput, CreateCardInput, UpdateCardInput } from '@/types/deck';
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
  addCardToDeck: (deckId: string, card: CreateCardInput) => Promise<void>;
  updateCard: (deckId: string, cardId: string, cardData: UpdateCardInput) => Promise<void>;
  deleteCard: (deckId: string, cardId: string) => Promise<void>;
  toggleFavorite: (deckId: string) => Promise<void>;
  isFavorite: (deckId: string) => boolean;
  getDeckByShareCode: (code: string) => Promise<Deck | null>;
  generateShareCode: (deckId: string) => string;
  copyDeck: (deckId: string) => Promise<Deck>;
  refreshDecks: () => Promise<void>;
}

const DeckContext = createContext<DeckContextType>({} as DeckContextType);

export const DeckProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { decks, loading, setDecks } = useDeckStorage();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  
  const {
    createDeck,
    updateDeck,
    deleteDeck,
  } = useDeckOperations(setDecks, user?.id);

  // Create a decks update callback to pass to useCardOperations
  const handleDecksUpdate = useCallback((updater: (prevDecks: Deck[]) => Deck[]) => {
    setDecks(updater);
  }, [setDecks]);

  const {
    addCardToDeck,
    updateCard,
    deleteCard,
  } = useCardOperations(handleDecksUpdate, user?.id);

  const {
    getDeckByShareCode,
    generateShareCode,
    copyDeck,
  } = useSharingOperations(decks, setDecks, user?.id);
  
  const getDeck = useCallback((id: string): Deck | null => {
    if (!id) return null;
    return decks.find(deck => deck.id === id) || null;
  }, [decks]);

  const refreshDecks = useCallback(async () => {
    console.log('Refreshing decks with user ID:', user?.id);
    if (!user) {
      console.log('Cannot refresh decks: User not authenticated');
      return;
    }
    
    try {
      console.log('Fetching fresh deck data from the server');
      const refreshedDecks = await deckService.getDecks();
      console.log('Refreshed decks received:', refreshedDecks.length);
      setDecks(refreshedDecks);
    } catch (error) {
      console.error('Error refreshing decks:', error);
    }
  }, [user, setDecks]);

  const contextValue = {
    decks,
    favorites,
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
  };

  return (
    <DeckContext.Provider value={contextValue}>
      {children}
    </DeckContext.Provider>
  );
};

export const useDeck = () => useContext(DeckContext);
