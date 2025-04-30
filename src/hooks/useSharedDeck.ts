
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeck } from '@/context/DeckContext';
import { useAuth } from '@/context/auth';
import { Deck } from '@/types/deck';
import { toast } from 'sonner';

export const useSharedDeck = (code: string | undefined) => {
  const navigate = useNavigate();
  const { getDeckByShareCode, toggleFavorite, isFavorite, copyDeck, followDeck, unfollowDeck, isFollowingDeck } = useDeck();
  const { isAuthenticated, user } = useAuth();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDeck = async () => {
      if (!code) {
        navigate('/');
        return;
      }
      
      setIsLoading(true);
      try {
        const fetchedDeck = await getDeckByShareCode(code);
        
        if (!fetchedDeck) {
          toast.error('Deck not found or no longer available');
          navigate('/');
          return;
        }
        
        // Check if this is user's own deck - if so, redirect to edit page
        if (isAuthenticated && user && fetchedDeck.creator_id === user.id) {
          navigate(`/deck/${fetchedDeck.id}`);
          return;
        }
        
        setDeck(fetchedDeck);
      } catch (error) {
        console.error('Error loading shared deck:', error);
        toast.error('Failed to load deck');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDeck();
  }, [code, getDeckByShareCode, navigate, isAuthenticated, user]);

  const handleFavorite = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add decks to favorites', {
        action: {
          label: 'Login',
          onClick: () => navigate('/auth'),
        },
      });
      return;
    }
    
    if (deck) {
      toggleFavorite(deck.id);
    }
  };

  const handleCopyDeck = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save this deck to your collection', {
        action: {
          label: 'Login',
          onClick: () => navigate('/auth'),
        },
      });
      return;
    }
    
    if (!deck) return;
    
    setIsCopying(true);
    try {
      const copiedDeck = await copyDeck(deck.id);
      toast.success('Deck saved to your collection!');
      navigate(`/deck/${copiedDeck.id}`);
    } catch (error) {
      console.error('Error copying deck:', error);
      toast.error('Failed to save deck to your collection');
    } finally {
      setIsCopying(false);
    }
  };

  const handleFollowDeck = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to follow this deck', {
        action: {
          label: 'Login',
          onClick: () => navigate('/auth'),
        },
      });
      return;
    }
    
    if (!deck) return;
    
    setIsTogglingFollow(true);
    try {
      await followDeck(deck.id);
      toast.success('You are now following this deck');
    } catch (error) {
      console.error('Error following deck:', error);
      toast.error('Failed to follow deck');
    } finally {
      setIsTogglingFollow(false);
    }
  };

  const handleUnfollowDeck = async () => {
    if (!isAuthenticated || !deck) return;
    
    setIsTogglingFollow(true);
    try {
      await unfollowDeck(deck.id);
      toast.success('You have unfollowed this deck');
    } catch (error) {
      console.error('Error unfollowing deck:', error);
      toast.error('Failed to unfollow deck');
    } finally {
      setIsTogglingFollow(false);
    }
  };

  return {
    deck,
    isLoading,
    isCopying,
    isTogglingFollow,
    isAuthenticated,
    isFavorite: deck ? isFavorite(deck.id) : false,
    isFollowing: deck ? isFollowingDeck(deck.id) : false,
    handleFavorite,
    handleCopyDeck,
    handleFollowDeck,
    handleUnfollowDeck,
  };
};
