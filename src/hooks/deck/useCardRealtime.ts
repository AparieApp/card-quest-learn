
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Flashcard } from '@/types/deck';
import { CardMapper } from '@/mappers/CardMapper';

export const useCardRealtime = (deckId: string, onCardChange: () => void) => {
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
          // Trigger refresh when any change occurs
          onCardChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [deckId, onCardChange]);
};
