
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDeck } from '@/context/DeckContext';

export const useCardRealtime = (deckId: string, onCardChange: () => void) => {
  const { isOptimisticUpdating } = useDeck();

  useEffect(() => {
    const channel = supabase
      .channel('flashcards-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'flashcards',
          filter: `deck_id=eq.${deckId}`
        },
        () => {
          // Only trigger refresh when not performing optimistic updates
          if (!isOptimisticUpdating) {
            onCardChange();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [deckId, onCardChange, isOptimisticUpdating]);
};
