import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth';
import { FollowedDeck, Deck } from '@/types/deck';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { followedDeckService } from '@/services/followedDeckService';

export const useFollowedDecks = () => {
  const { user } = useAuth();
  const [followedDecks, setFollowedDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowedDecks = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const decks = await followedDeckService.getFollowedDecksWithDetails(user.id);
      setFollowedDecks(decks);
    } catch (error) {
      console.error('Error fetching followed decks:', error);
      toast.error('Failed to load followed decks');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const followDeck = useCallback(async (deckId: string) => {
    if (!user?.id) {
      toast.error('You must be logged in to follow a deck');
      return false;
    }

    try {
      const success = await followedDeckService.followDeck(user.id, deckId);
      
      if (success) {
        await fetchFollowedDecks();
        toast.success('Deck followed successfully');
      }
      
      return success;
    } catch (error) {
      console.error('Error following deck:', error);
      toast.error('Failed to follow deck');
      return false;
    }
  }, [user, fetchFollowedDecks]);

  const unfollowDeck = useCallback(async (deckId: string) => {
    if (!user?.id) return false;

    try {
      const success = await followedDeckService.unfollowDeck(user.id, deckId);
      
      if (success) {
        setFollowedDecks(prev => prev.filter(deck => deck.id !== deckId));
        toast.success('Deck unfollowed');
      }
      
      return success;
    } catch (error) {
      console.error('Error unfollowing deck:', error);
      toast.error('Failed to unfollow deck');
      return false;
    }
  }, [user]);

  const isFollowing = useCallback((deckId: string) => {
    return followedDecks.some(deck => deck.id === deckId);
  }, [followedDecks]);

  useEffect(() => {
    if (user?.id) {
      fetchFollowedDecks();
    } else {
      setFollowedDecks([]);
      setLoading(false);
    }
  }, [user, fetchFollowedDecks]);

  return {
    followedDecks,
    loading,
    followDeck,
    unfollowDeck,
    isFollowing,
    refreshFollowedDecks: fetchFollowedDecks
  };
}; 