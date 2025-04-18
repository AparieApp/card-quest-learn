
import { useState, useEffect } from 'react';
import { Deck } from '@/types/deck';
import { toast } from 'sonner';

export const useDeckStorage = (userId: string | undefined) => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      const storedDecks = localStorage.getItem(`flashcard_decks_${userId}`);
      if (storedDecks) {
        setDecks(JSON.parse(storedDecks));
      }
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      localStorage.setItem(`flashcard_decks_${userId}`, JSON.stringify(decks));
    }
  }, [decks, userId]);

  const updateDecks = (newDecks: Deck[]) => {
    setDecks(newDecks);
  };

  return { decks, loading, updateDecks };
};
