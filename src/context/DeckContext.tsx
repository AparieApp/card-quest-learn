
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

// Define types
export interface Flashcard {
  id: string;
  front_text: string;
  correct_answer: string;
  incorrect_answers: string[];
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
}

interface DeckContextType {
  decks: Deck[];
  favorites: string[];
  loading: boolean;
  createDeck: (title: string, description?: string) => Promise<Deck>;
  updateDeck: (id: string, title: string, description?: string) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
  getDeck: (id: string) => Deck | undefined;
  addCardToDeck: (deckId: string, card: Omit<Flashcard, 'id' | 'created_at'>) => Promise<void>;
  updateCard: (deckId: string, cardId: string, cardData: Partial<Omit<Flashcard, 'id' | 'created_at'>>) => Promise<void>;
  deleteCard: (deckId: string, cardId: string) => Promise<void>;
  toggleFavorite: (deckId: string) => Promise<void>;
  isFavorite: (deckId: string) => boolean;
  getDeckByShareCode: (code: string) => Deck | undefined;
  generateShareCode: (deckId: string) => string;
}

const DeckContext = createContext<DeckContextType>({
  decks: [],
  favorites: [],
  loading: true,
  createDeck: async () => ({ id: '', creator_id: '', title: '', created_at: '', updated_at: '', cards: [] }),
  updateDeck: async () => {},
  deleteDeck: async () => {},
  getDeck: () => undefined,
  addCardToDeck: async () => {},
  updateCard: async () => {},
  deleteCard: async () => {},
  toggleFavorite: async () => {},
  isFavorite: () => false,
  getDeckByShareCode: () => undefined,
  generateShareCode: () => '',
});

export const DeckProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareCodes, setShareCodes] = useState<Record<string, string>>({});

  // Load decks from localStorage
  useEffect(() => {
    if (user) {
      const storedDecks = localStorage.getItem(`flashcard_decks_${user.id}`);
      if (storedDecks) {
        setDecks(JSON.parse(storedDecks));
      }
      
      const storedFavorites = localStorage.getItem(`flashcard_favorites_${user.id}`);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
      
      const storedShareCodes = localStorage.getItem('flashcard_share_codes');
      if (storedShareCodes) {
        setShareCodes(JSON.parse(storedShareCodes));
      }
    }
    setLoading(false);
  }, [user]);

  // Save decks to localStorage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`flashcard_decks_${user.id}`, JSON.stringify(decks));
    }
  }, [decks, user]);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`flashcard_favorites_${user.id}`, JSON.stringify(favorites));
    }
  }, [favorites, user]);

  // Save share codes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('flashcard_share_codes', JSON.stringify(shareCodes));
  }, [shareCodes]);

  const createDeck = async (title: string, description?: string): Promise<Deck> => {
    if (!user) throw new Error('User not authenticated');
    
    const newDeck: Deck = {
      id: `deck_${Date.now()}`,
      creator_id: user.id,
      title,
      description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cards: [],
    };
    
    setDecks(prev => [...prev, newDeck]);
    toast.success(`Deck "${title}" created!`);
    return newDeck;
  };

  const updateDeck = async (id: string, title: string, description?: string) => {
    if (!user) throw new Error('User not authenticated');
    
    setDecks(prev => prev.map(deck => 
      deck.id === id ? { 
        ...deck, 
        title, 
        description, 
        updated_at: new Date().toISOString() 
      } : deck
    ));
    toast.success(`Deck updated!`);
  };

  const deleteDeck = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    
    setDecks(prev => prev.filter(deck => deck.id !== id));
    
    // Also remove from favorites if it was favorited
    if (favorites.includes(id)) {
      setFavorites(prev => prev.filter(favId => favId !== id));
    }
    
    toast.success(`Deck deleted!`);
  };

  const getDeck = (id: string) => {
    return decks.find(deck => deck.id === id);
  };

  const addCardToDeck = async (deckId: string, card: Omit<Flashcard, 'id' | 'created_at'>) => {
    if (!user) throw new Error('User not authenticated');
    
    const newCard: Flashcard = {
      id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      ...card,
    };
    
    setDecks(prev => prev.map(deck => 
      deck.id === deckId ? {
        ...deck,
        updated_at: new Date().toISOString(),
        cards: [...deck.cards, newCard],
      } : deck
    ));
    toast.success('Card added!');
  };

  const updateCard = async (deckId: string, cardId: string, cardData: Partial<Omit<Flashcard, 'id' | 'created_at'>>) => {
    if (!user) throw new Error('User not authenticated');
    
    setDecks(prev => prev.map(deck => 
      deck.id === deckId ? {
        ...deck,
        updated_at: new Date().toISOString(),
        cards: deck.cards.map(card => 
          card.id === cardId ? { ...card, ...cardData } : card
        ),
      } : deck
    ));
    toast.success('Card updated!');
  };

  const deleteCard = async (deckId: string, cardId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    setDecks(prev => prev.map(deck => 
      deck.id === deckId ? {
        ...deck,
        updated_at: new Date().toISOString(),
        cards: deck.cards.filter(card => card.id !== cardId),
      } : deck
    ));
    toast.success('Card deleted!');
  };

  const toggleFavorite = async (deckId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    if (favorites.includes(deckId)) {
      setFavorites(prev => prev.filter(id => id !== deckId));
      toast.success('Removed from favorites!');
    } else {
      setFavorites(prev => [...prev, deckId]);
      toast.success('Added to favorites!');
    }
  };

  const isFavorite = (deckId: string): boolean => {
    return favorites.includes(deckId);
  };

  // Generate a unique share code for a deck
  const generateShareCode = (deckId: string): string => {
    // Check if we already have a code for this deck
    const existingCode = Object.entries(shareCodes).find(([_, id]) => id === deckId)?.[0];
    if (existingCode) return existingCode;
    
    // Generate a new code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setShareCodes(prev => ({ ...prev, [code]: deckId }));
    return code;
  };

  // Get a deck by its share code
  const getDeckByShareCode = (code: string): Deck | undefined => {
    const deckId = shareCodes[code];
    if (!deckId) return undefined;
    
    return decks.find(deck => deck.id === deckId);
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
      }}
    >
      {children}
    </DeckContext.Provider>
  );
};

export const useDeck = () => useContext(DeckContext);
