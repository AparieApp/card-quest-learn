
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Deck, CreateDeckInput, UpdateDeckInput, CreateCardInput, UpdateCardInput } from '@/types/deck';
import { deckService } from '@/services/deckService';
import { useDeckStorage } from '@/hooks/useDeckStorage';
import { useFavorites } from '@/hooks/useFavorites';
import { useSharing } from '@/hooks/useSharing';
import { toast } from 'sonner';

interface DeckContextType {
  decks: Deck[];
  favorites: string[];
  loading: boolean;
  createDeck: (input: CreateDeckInput) => Promise<Deck>;
  updateDeck: (id: string, input: UpdateDeckInput) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
  getDeck: (id: string) => Deck | undefined;
  addCardToDeck: (deckId: string, card: CreateCardInput) => Promise<void>;
  updateCard: (deckId: string, cardId: string, cardData: UpdateCardInput) => Promise<void>;
  deleteCard: (deckId: string, cardId: string) => Promise<void>;
  toggleFavorite: (deckId: string) => Promise<void>;
  isFavorite: (deckId: string) => boolean;
  getDeckByShareCode: (code: string) => Deck | undefined;
  generateShareCode: (deckId: string) => string;
  copyDeck: (deckId: string) => Promise<Deck>;
}

const DeckContext = createContext<DeckContextType>({} as DeckContextType);

export const DeckProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { decks, loading, updateDecks } = useDeckStorage(user?.id);
  const { favorites, toggleFavorite, isFavorite } = useFavorites(user?.id);
  const { generateShareCode, getDeckByShareCode: getSharedDeckId } = useSharing();

  const createDeck = async (input: CreateDeckInput): Promise<Deck> => {
    if (!user) throw new Error('User not authenticated');
    
    const newDeck = deckService.createDeck(user.id, input);
    updateDecks([...decks, newDeck]);
    toast.success(`Deck "${input.title}" created!`);
    return newDeck;
  };

  const updateDeck = async (id: string, input: UpdateDeckInput) => {
    if (!user) throw new Error('User not authenticated');
    
    const deck = getDeck(id);
    if (!deck) throw new Error('Deck not found');
    
    const updatedDeck = deckService.updateDeck(deck, input);
    updateDecks(decks.map(d => d.id === id ? updatedDeck : d));
    toast.success('Deck updated!');
  };

  const deleteDeck = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    
    updateDecks(decks.filter(deck => deck.id !== id));
    toast.success('Deck deleted!');
  };

  const getDeck = (id: string) => {
    return decks.find(deck => deck.id === id);
  };

  const addCardToDeck = async (deckId: string, card: CreateCardInput) => {
    if (!user) throw new Error('User not authenticated');
    
    const deck = getDeck(deckId);
    if (!deck) throw new Error('Deck not found');
    
    const updatedDeck = deckService.addCard(deck, card);
    updateDecks(decks.map(d => d.id === deckId ? updatedDeck : d));
    toast.success('Card added!');
  };

  const updateCard = async (deckId: string, cardId: string, cardData: UpdateCardInput) => {
    if (!user) throw new Error('User not authenticated');
    
    const deck = getDeck(deckId);
    if (!deck) throw new Error('Deck not found');
    
    const updatedDeck = deckService.updateCard(deck, cardId, cardData);
    updateDecks(decks.map(d => d.id === deckId ? updatedDeck : d));
    toast.success('Card updated!');
  };

  const deleteCard = async (deckId: string, cardId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    const deck = getDeck(deckId);
    if (!deck) throw new Error('Deck not found');
    
    const updatedDeck = deckService.deleteCard(deck, cardId);
    updateDecks(decks.map(d => d.id === deckId ? updatedDeck : d));
    toast.success('Card deleted!');
  };

  const getDeckByShareCode = (code: string): Deck | undefined => {
    const deckId = getSharedDeckId(code);
    if (!deckId) return undefined;
    return getDeck(deckId);
  };

  const copyDeck = async (deckId: string): Promise<Deck> => {
    if (!user) throw new Error('User not authenticated');
    
    const sourceDeck = getDeck(deckId);
    if (!sourceDeck) throw new Error('Deck not found');
    
    const copiedDeck = deckService.copyDeck(user.id, sourceDeck);
    updateDecks([...decks, copiedDeck]);
    return copiedDeck;
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
      }}
    >
      {children}
    </DeckContext.Provider>
  );
};

export const useDeck = () => useContext(DeckContext);
