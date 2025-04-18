
import { useState, useEffect } from 'react';
import { favoriteService } from '@/services/favoriteService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isAuthenticated || !user) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const fetchedFavorites = await favoriteService.getFavorites(user.id);
        setFavorites(fetchedFavorites);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [isAuthenticated, user]);

  const toggleFavorite = async (deckId: string) => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in to add decks to favorites', {
        action: {
          label: 'Login',
          onClick: () => window.location.href = '/auth',
        },
      });
      return;
    }

    try {
      const isFavorited = favorites.includes(deckId);
      
      if (isFavorited) {
        await favoriteService.removeFavorite(user.id, deckId);
        setFavorites(prev => prev.filter(id => id !== deckId));
        toast.success('Removed from favorites!');
      } else {
        await favoriteService.addFavorite(user.id, deckId);
        setFavorites(prev => [...prev, deckId]);
        toast.success('Added to favorites!');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const isFavorite = (deckId: string): boolean => {
    return favorites.includes(deckId);
  };

  return { favorites, toggleFavorite, isFavorite, loading };
};
