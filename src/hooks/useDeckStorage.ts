
import { useState, useEffect } from 'react';
import { Deck } from '@/types/deck';
import { deckService } from '@/services/deckService';
import { useAuth } from '@/context/auth';

export const useDeckStorage = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchDecks = async () => {
      if (!isAuthenticated || !user) {
        setDecks([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const fetchedDecks = await deckService.getDecks();
        setDecks(fetchedDecks);
      } catch (error) {
        console.error('Error fetching decks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDecks();
  }, [isAuthenticated, user]);

  return { decks, loading, setDecks };
};
