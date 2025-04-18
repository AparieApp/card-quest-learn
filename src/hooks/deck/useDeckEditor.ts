
import { useState, useEffect } from 'react';
import { UpdateDeckInput, Deck } from '@/types/deck';
import { useDeck } from '@/context/DeckContext';
import { toast } from 'sonner';

export const useDeckEditor = (deckId: string, initialDeck?: Deck | null) => {
  const { getDeck, updateDeck } = useDeck();
  const [title, setTitle] = useState(initialDeck?.title || '');
  const [description, setDescription] = useState(initialDeck?.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialDeck);
  
  // Only load the deck if no initial deck is provided and we have a deckId
  useEffect(() => {
    if (initialDeck) {
      setTitle(initialDeck.title);
      setDescription(initialDeck.description || '');
      setIsLoading(false);
    } else if (deckId && !initialDeck) {
      loadDeck();
    }
  }, [deckId, initialDeck]);

  const loadDeck = () => {
    setIsLoading(true);
    try {
      const deck = getDeck(deckId);
      if (deck) {
        setTitle(deck.title);
        setDescription(deck.description || '');
      } else {
        toast.error('Deck not found');
      }
    } catch (error) {
      console.error('Error loading deck:', error);
      toast.error('Failed to load deck');
    } finally {
      setIsLoading(false);
    }
    
    return null;
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
