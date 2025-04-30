
import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useAuth } from '@/context/auth';
import { Deck, CreateDeckInput, UpdateDeckInput, CreateCardInput, UpdateCardInput, Flashcard } from '@/types/deck';
import { useDeckStorage } from '@/hooks/useDeckStorage';
import { useFavorites } from '@/hooks/useFavorites';
import { useDeckOperations } from '@/hooks/deck/useDeckOperations';
import { useCardOperations } from '@/hooks/deck/useCardOperations';
import { useSharingOperations } from '@/hooks/deck/useSharingOperations';
import { deckService } from '@/services/deckService';
import { useFollowedDecks } from '@/hooks/useFollowedDecks';

interface DeckContextType {
  decks: Deck[];
  favorites: string[];
  followedDeckIds: string[];
  followedDecks: Deck[];
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
  followDeck: (deckId: string) => Promise<boolean>;
  unfollowDeck: (deckId: string) => Promise<boolean>;
  isFollowingDeck: (deckId: string) => boolean;
  getDeckByShareCode: (code: string) => Promise<Deck | null>;
  generateShareCode: (deckId: string) => string;
  copyDeck: (deckId: string) => Promise<Deck>;
  refreshDecks: (bypassThrottle?: boolean) => Promise<void>;
  isOptimisticUpdating: boolean;
  setThrottlingPaused: (value: boolean) => void;
}

const DeckContext = createContext<DeckContextType>({
  decks: [],
  favorites: [],
  followedDeckIds: [],
  followedDecks: [],
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
  followDeck: async () => false,
  unfollowDeck: async () => false,
  isFollowingDeck: () => false,
  getDeckByShareCode: async () => null,
  generateShareCode: () => '',
  copyDeck: async () => ({ id: '', title: '', description: '', creator_id: '', created_at: '', updated_at: '', cards: [] }),
  refreshDecks: async () => {},
  isOptimisticUpdating: false,
  setThrottlingPaused: () => {},
});

export const DeckProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { decks = [], loading, setDecks, refreshDecks: refreshStoredDecks, setBypassThrottle } = useDeckStorage();
  const { favorites = [], toggleFavorite, isFavorite } = useFavorites();
  const { 
    followedDeckIds = [], 
    followedDecks = [],
    followDeck, 
    unfollowDeck, 
    isFollowingDeck, 
    refreshFollowedDecks 
  } = useFollowedDecks();
  
  const userId = user?.id;
  
  const {
    createDeck,
    updateDeck,
    deleteDeck,
  } = useDeckOperations(setDecks, userId);

  const handleDecksUpdate = useCallback((updater: (prevDecks: Deck[]) => Deck[]) => {
    setDecks(updater);
  }, [setDecks]);

  const refreshDecks = useCallback(async (bypassThrottle?: boolean) => {
    console.log('Refreshing decks with user ID:', userId);
    if (!userId) {
      console.log('Cannot refresh decks: User not authenticated');
      return;
    }
    
    try {
      await refreshStoredDecks(bypassThrottle);
      await refreshFollowedDecks();
    } catch (error) {
      console.error('Error refreshing decks:', error);
    }
  }, [userId, refreshStoredDecks, refreshFollowedDecks]);

  const {
    addCardToDeck,
    updateCard,
    deleteCard,
    isOptimisticUpdating,
    setThrottlingPaused
  } = useCardOperations(handleDecksUpdate, userId, refreshDecks);

  const {
    getDeckByShareCode,
    generateShareCode,
    copyDeck,
  } = useSharingOperations(decks, followedDecks, setDecks, userId);
  
  const getDeck = useCallback((id: string): Deck | null => {
    if (!id) return null;
    
    // First check user-created decks
    let deck = Array.isArray(decks) ? decks.find(deck => deck.id === id) || null : null;
    
    // If not found, check followed decks
    if (!deck && Array.isArray(followedDecks)) {
      deck = followedDecks.find(deck => deck.id === id) || null;
    }
    
    return deck;
  }, [decks, followedDecks]);

  // Connect the setBypassThrottle from useDeckStorage to the setThrottlingPaused exposed by context
  const handleSetThrottlingPaused = useCallback((value: boolean) => {
    console.log(`Setting throttling paused to ${value}`);
    setBypassThrottle(value);
  }, [setBypassThrottle]);

  const contextValue = {
    decks: Array.isArray(decks) ? decks : [],
    favorites: Array.isArray(favorites) ? favorites : [],
    followedDeckIds: Array.isArray(followedDeckIds) ? followedDeckIds : [],
    followedDecks: Array.isArray(followedDecks) ? followedDecks : [],
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
    followDeck,
    unfollowDeck,
    isFollowingDeck,
    getDeckByShareCode,
    generateShareCode,
    copyDeck,
    refreshDecks,
    isOptimisticUpdating,
    setThrottlingPaused: handleSetThrottlingPaused,
  };

  return (
    <DeckContext.Provider value={contextValue}>
      {children}
    </DeckContext.Provider>
  );
};

export const useDeck = () => useContext(DeckContext);
