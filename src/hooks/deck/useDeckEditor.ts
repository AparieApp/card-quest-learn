
import { useState, useEffect } from 'react';
import { UpdateDeckInput, Deck } from '@/types/deck';
import { useDeck } from '@/context/DeckContext';
import { toast } from 'sonner';

export const useDeckEditor = (deckId: string, initialDeck?: Deck | null) => {
  const { getDeck, updateDeck } = useDeck();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialDeck);

  const loadDeck = () => {
    if (initialDeck) {
      setTitle(initialDeck.title);
      setDescription(initialDeck.description || '');
      setIsLoading(false);
      return initialDeck;
    }
    
    setIsLoading(true);
    try {
      const deck = getDeck(deckId);
      if (deck) {
        setTitle(deck.title);
        setDescription(deck.description || '');
      }
      setIsLoading(false);
      return deck;
    } catch (error) {
      console.error('Error loading deck:', error);
      toast.error('Failed to load deck');
      setIsLoading(false);
      return null;
    }
  };

  const saveDeck = async () => {
    if (!title) {
      toast.error('Title is required');
      return;
    }
    
    setIsSaving(true);
    try {
      const updateInput: UpdateDeckInput = {
        title,
        description
      };
      await updateDeck(deckId, updateInput);
      toast.success('Deck updated successfully');
    } catch (error) {
      console.error('Error saving deck:', error);
      toast.error('Failed to update deck');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (initialDeck) {
      setTitle(initialDeck.title);
      setDescription(initialDeck.description || '');
      setIsLoading(false);
    } else {
      loadDeck();
    }
  }, [deckId, initialDeck]);

  return {
    title,
    setTitle,
    description,
    setDescription,
    isSaving,
    isLoading,
    loadDeck,
    saveDeck
  };
};
