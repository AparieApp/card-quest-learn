
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeck } from '@/context/DeckContext';
import { useAuth } from '@/context/AuthContext';
import { Deck } from '@/types/deck';
import { toast } from 'sonner';

export const useSharedDeck = (code: string | undefined) => {
  const navigate = useNavigate();
  const { getDeckByShareCode, toggleFavorite, isFavorite, copyDeck } = useDeck();
  const { isAuthenticated } = useAuth();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [isCopying, setIsCopying] = useState(false);
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
        setDeck(fetchedDeck);
      } catch (error) {
        console.error('Error loading shared deck:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDeck();
  }, [code, getDeckByShareCode, navigate]);

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

  return {
    deck,
    isLoading,
    isCopying,
    isAuthenticated,
    isFavorite: deck ? isFavorite(deck.id) : false,
    handleFavorite,
    handleCopyDeck,
  };
};
