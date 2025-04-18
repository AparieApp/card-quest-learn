
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
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
    // We'll override getDeck with our own implementation
  } = useDeckOperations(setDecks, user?.id);

  const {
    addCardToDeck,
    updateCard,
    deleteCard,
  } = useCardOperations(setDecks, user?.id);

  const {
    getDeckByShareCode,
    generateShareCode,
    copyDeck,
  } = useSharingOperations(decks, setDecks, user?.id);
  
  // Local implementation of getDeck using the actual decks state
  const getDeck = (id: string): Deck | null => {
    if (!id) return null;
    return decks.find(deck => deck.id === id) || null;
  };

  const refreshDecks = async () => {
    if (!user) return;
    
    try {
      const refreshedDecks = await deckService.getDecks();
      setDecks(refreshedDecks);
    } catch (error) {
      console.error('Error refreshing decks:', error);
    }
  };

  return (
    <DeckContext.Provider
      value={{
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
        refreshDecks
      }}
    >
      {children}
    </DeckContext.Provider>
  );
};

export const useDeck = () => useContext(DeckContext);
