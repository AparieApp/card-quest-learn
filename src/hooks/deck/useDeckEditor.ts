
import { useState, useEffect } from 'react';
import { UpdateDeckInput } from '@/types/deck';
import { useDeck } from '@/context/DeckContext';
import { toast } from 'sonner';

export const useDeckEditor = (deckId: string) => {
  const { getDeck, updateDeck } = useDeck();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadDeck = async () => {
    setIsLoading(true);
    try {
      const deck = await getDeck(deckId);
      if (deck) {
        setTitle(deck.title);
        setDescription(deck.description || '');
      }
      return deck;
    } catch (error) {
      console.error('Error loading deck:', error);
      toast.error('Failed to load deck');
      return null;
    } finally {
      setIsLoading(false);
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
    loadDeck();
  }, [deckId]);

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
