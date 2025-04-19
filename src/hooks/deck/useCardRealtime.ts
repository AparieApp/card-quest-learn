
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCardOperations } from '@/hooks/deck/useCardOperations';

export const useCardRealtime = (deckId: string, onCardChange: () => void) => {
  const { isOptimisticUpdating } = useCardOperations(() => {}, undefined);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  
  useEffect(() => {
    if (!deckId) {
      console.log('No deck ID provided for realtime subscription');
      return;
    }
    
    console.log('Setting up realtime subscription for deck:', deckId);
    
    // Clean up any existing channel before creating a new one
    if (channelRef.current) {
      console.log('Removing existing channel before creating new one');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    const channel = supabase
      .channel(`flashcards-changes-${deckId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'flashcards',
          filter: `deck_id=eq.${deckId}`
        },
        (payload) => {
          console.log('Realtime update received:', payload.eventType, payload);
          
          if (isOptimisticUpdating) {
            console.log('Skipping realtime update during optimistic update');
            return;
          }
          
          console.log('Processing realtime update (not during optimistic update)');
          onCardChange();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        setIsSubscribed(status === 'SUBSCRIBED');
        
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to realtime updates for deck:', deckId);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to realtime updates');
        }
      });
    
    channelRef.current = channel;

    return () => {
      console.log('Cleaning up realtime subscription for deck:', deckId);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        setIsSubscribed(false);
      }
    };
  }, [deckId, onCardChange, isOptimisticUpdating]);

  return { isSubscribed };
};
