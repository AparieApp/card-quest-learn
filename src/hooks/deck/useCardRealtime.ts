
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCardOperations } from '@/hooks/deck/useCardOperations';

export const useCardRealtime = (deckId: string, onCardChange: () => void) => {
  const { isOptimisticUpdating } = useCardOperations(() => {}, undefined);

  useEffect(() => {
    console.log('Setting up realtime subscription for deck:', deckId);
    
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
        (payload) => {
          console.log('Realtime update received:', payload);
          if (!isOptimisticUpdating) {
            console.log('Processing realtime update (not during optimistic update)');
            onCardChange();
          } else {
            console.log('Skipping realtime update during optimistic update');
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [deckId, onCardChange, isOptimisticUpdating]);
};
