
import { useState, useEffect, useCallback } from 'react';
import { followedDeckService } from '@/services/followedDeckService';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';

export const useFollowedDecks = () => {
  const [followedDeckIds, setFollowedDeckIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();
  
  const fetchFollowedDecks = useCallback(async () => {
    if (!isAuthenticated) {
      setFollowedDeckIds([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const deckIds = await followedDeckService.getFollowedDecks();
      console.log('Fetched followed deck IDs:', deckIds.length);
      setFollowedDeckIds(deckIds);
    } catch (error) {
      console.error('Error fetching followed decks:', error);
      toast.error('Failed to load followed decks');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);
  
  useEffect(() => {
    fetchFollowedDecks();
  }, [fetchFollowedDecks]);
  
  const followDeck = useCallback(async (deckId: string) => {
    if (!isAuthenticated) {
      toast.error('Please log in to follow this deck');
      return false;
    }
    
    try {
      await followedDeckService.followDeck(deckId);
      setFollowedDeckIds(prev => {
        if (prev.includes(deckId)) return prev;
        return [...prev, deckId];
      });
      return true;
    } catch (error) {
      console.error('Error following deck:', error);
      toast.error('Failed to follow deck');
      return false;
    }
  }, [isAuthenticated]);
  
  const unfollowDeck = useCallback(async (deckId: string) => {
    if (!isAuthenticated) return false;
    
    try {
      await followedDeckService.unfollowDeck(deckId);
      setFollowedDeckIds(prev => prev.filter(id => id !== deckId));
      return true;
    } catch (error) {
      console.error('Error unfollowing deck:', error);
      toast.error('Failed to unfollow deck');
      return false;
    }
  }, [isAuthenticated]);
  
  const isFollowingDeck = useCallback((deckId: string) => {
    return followedDeckIds.includes(deckId);
  }, [followedDeckIds]);

  return {
    followedDeckIds,
    isLoading,
    followDeck,
    unfollowDeck,
    isFollowingDeck,
    refreshFollowedDecks: fetchFollowedDecks
  };
};
