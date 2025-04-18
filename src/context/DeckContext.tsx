
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Deck, CreateDeckInput, UpdateDeckInput, CreateCardInput, UpdateCardInput } from '@/types/deck';
import { deckService } from '@/services/deckService';
import { useDeckStorage } from '@/hooks/useDeckStorage';
import { useFavorites } from '@/hooks/useFavorites';
import { useSharing } from '@/hooks/useSharing';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface DeckContextType {
  decks: Deck[];
  favorites: string[];
  loading: boolean;
  createDeck: (input: CreateDeckInput) => Promise<Deck>;
  updateDeck: (id: string, input: UpdateDeckInput) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
  getDeck: (id: string) => Deck | null;  // Changed from Promise<Deck | null> to Deck | null
  addCardToDeck: (deckId: string, card: CreateCardInput) => Promise<void>;
  updateCard: (deckId: string, cardId: string, cardData: UpdateCardInput) => Promise<void>;
  deleteCard: (deckId: string, cardId: string) => Promise<void>;
  toggleFavorite: (deckId: string) => Promise<void>;
  isFavorite: (deckId: string) => boolean;
  getDeckByShareCode: (code: string) => Promise<Deck | null>;
  generateShareCode: (deckId: string) => string;  // Changed from Promise<string> to string
  copyDeck: (deckId: string) => Promise<Deck>;
  refreshDecks: () => Promise<void>;
}

const DeckContext = createContext<DeckContextType>({} as DeckContextType);

export const DeckProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { decks, loading, setDecks } = useDeckStorage();
  const { favorites, toggleFavorite: toggleFav, isFavorite } = useFavorites();
  const { generateShareCode: genShareCode, getDeckByShareCode: getSharedDeckId } = useSharing();
  const queryClient = useQueryClient();
  const [shareCodeCache, setShareCodeCache] = useState<Record<string, string>>({});

  const refreshDecks = async () => {
    if (!user) return;
    
    try {
      const fetchedDecks = await deckService.getDecks();
      setDecks(fetchedDecks);
    } catch (error) {
      console.error('Error refreshing decks:', error);
    }
  };

  const createDeck = async (input: CreateDeckInput): Promise<Deck> => {
    if (!user) throw new Error('User not authenticated');
    
    const newDeck = await deckService.createDeck(user.id, input);
    setDecks(prev => [newDeck, ...prev]);
    toast.success(`Deck "${input.title}" created!`);
    return newDeck;
  };

  const updateDeck = async (id: string, input: UpdateDeckInput) => {
    if (!user) throw new Error('User not authenticated');
    
    await deckService.updateDeck(id, input);
    
    setDecks(prev => prev.map(d => d.id === id ? { ...d, ...input, updated_at: new Date().toISOString() } : d));
    toast.success('Deck updated!');
  };

  const deleteDeck = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    
    await deckService.deleteDeck(id);
    setDecks(prev => prev.filter(deck => deck.id !== id));
    toast.success('Deck deleted!');
  };

  const getDeck = (id: string): Deck | null => {
    // First check local cache
    const cachedDeck = decks.find(deck => deck.id === id);
    if (cachedDeck) return cachedDeck;
    return null;
  };

  const addCardToDeck = async (deckId: string, card: CreateCardInput) => {
    if (!user) throw new Error('User not authenticated');
    
    const newCard = await deckService.addCard(deckId, card);
    
    setDecks(prev => 
      prev.map(deck => 
        deck.id === deckId 
          ? { ...deck, cards: [...deck.cards, newCard], updated_at: new Date().toISOString() } 
          : deck
      )
    );
    
    toast.success('Card added!');
  };

  const updateCard = async (deckId: string, cardId: string, cardData: UpdateCardInput) => {
    if (!user) throw new Error('User not authenticated');
    
    await deckService.updateCard(cardId, cardData);
    
    setDecks(prev => 
      prev.map(deck => 
        deck.id === deckId 
          ? { 
              ...deck, 
              updated_at: new Date().toISOString(),
              cards: deck.cards.map(card => 
                card.id === cardId ? { ...card, ...cardData } : card
              ) 
            } 
          : deck
      )
    );
    
    toast.success('Card updated!');
  };

  const deleteCard = async (deckId: string, cardId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    await deckService.deleteCard(cardId);
    
    setDecks(prev => 
      prev.map(deck => 
        deck.id === deckId 
          ? { 
              ...deck, 
              updated_at: new Date().toISOString(),
              cards: deck.cards.filter(card => card.id !== cardId) 
            } 
          : deck
      )
    );
    
    toast.success('Card deleted!');
  };

  const getDeckByShareCode = async (code: string): Promise<Deck | null> => {
    try {
      const deckId = await getSharedDeckId(code);
      if (!deckId) return null;
      
      // Check if we have this deck in the local cache
      const cachedDeck = decks.find(d => d.id === deckId);
      if (cachedDeck) return cachedDeck;
      
      // If not, fetch it from the database
      return await deckService.getDeck(deckId);
    } catch (error) {
      console.error('Error getting deck by share code:', error);
      return null;
    }
  };

  const generateShareCode = (deckId: string): string => {
    if (!user) throw new Error('User not authenticated');
    
    // First check if we have a cached share code
    if (shareCodeCache[deckId]) {
      return shareCodeCache[deckId];
    }
    
    // Generate and cache a new code
    // Note: This is now synchronous, but the actual saving to DB happens in background
    const code = genShareCode(deckId);
    setShareCodeCache(prev => ({...prev, [deckId]: code}));
    return code;
  };

  const copyDeck = async (deckId: string): Promise<Deck> => {
    if (!user) throw new Error('User not authenticated');
    
    const copiedDeck = await deckService.copyDeck(user.id, deckId);
    setDecks(prev => [copiedDeck, ...prev]);
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
        toggleFavorite: toggleFav,
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
