
import { useState } from 'react';
import { UpdateDeckInput } from '@/types/deck';
import { useDeck } from '@/context/DeckContext';
import { toast } from 'sonner';

export const useDeckEditor = (deckId: string) => {
  const { getDeck, updateDeck } = useDeck();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadDeck = () => {
    const deck = getDeck(deckId);
    if (deck) {
      setTitle(deck.title);
      setDescription(deck.description || '');
    }
    return deck;
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
    loadDeck,
    saveDeck
  };
};
