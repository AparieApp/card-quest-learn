
import { useState, useEffect, useCallback } from 'react';
import { followedDeckService } from '@/services/followedDeckService';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
import { Deck } from '@/types/deck';

export const useFollowedDecks = () => {
  const [followedDeckIds, setFollowedDeckIds] = useState<string[]>([]);
  const [followedDecks, setFollowedDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  
  // Using a stable reference to the service functions to avoid dependency issues
  const fetchFollowedDeckIdsFromServer = useCallback(async () => {
    return await followedDeckService.getFollowedDecks();
  }, []);
  
  const fetchFollowedDecksDataFromServer = useCallback(async () => {
    return await followedDeckService.getFollowedDecksData();
  }, []);
  
  // Fixed fetchFollowedDecks to avoid circular dependencies
  const fetchFollowedDecks = useCallback(async () => {
    if (!isAuthenticated) {
      setFollowedDeckIds([]);
      setFollowedDecks([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      // Get followed deck IDs
      const deckIds = await fetchFollowedDeckIdsFromServer();
      console.log('Fetched followed deck IDs:', deckIds.length);
      setFollowedDeckIds(deckIds);
      
      // Get complete deck data for followed decks
      if (deckIds.length > 0) {
        const decks = await fetchFollowedDecksDataFromServer();
        setFollowedDecks(decks);
      } else {
        setFollowedDecks([]);
      }
    } catch (error) {
      console.error('Error fetching followed decks:', error);
      toast.error('Failed to load followed decks');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchFollowedDeckIdsFromServer, fetchFollowedDecksDataFromServer]);
  
  useEffect(() => {
    fetchFollowedDecks();
  }, [fetchFollowedDecks]);
  
  // Follow deck function with stable dependencies
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
      
      // Get the updated decks data after following
      const updatedDecks = await fetchFollowedDecksDataFromServer();
      setFollowedDecks(updatedDecks);
      
      return true;
    } catch (error) {
      console.error('Error following deck:', error);
      toast.error('Failed to follow deck');
      return false;
    }
  }, [isAuthenticated, fetchFollowedDecksDataFromServer]);
  
  // Unfollow deck function with stable dependencies
  const unfollowDeck = useCallback(async (deckId: string) => {
    if (!isAuthenticated) return false;
    
    try {
      await followedDeckService.unfollowDeck(deckId);
      setFollowedDeckIds(prev => prev.filter(id => id !== deckId));
      setFollowedDecks(prev => prev.filter(deck => deck.id !== deckId));
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
    followedDecks,
    isLoading,
    followDeck,
    unfollowDeck,
    isFollowingDeck,
    refreshFollowedDecks: fetchFollowedDecks
  };
};
