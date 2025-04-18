
import { useState, useEffect } from 'react';
import { favoriteService } from '@/services/favoriteService';
import { toast } from 'sonner';

export const useFavorites = (userId: string | undefined) => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (userId) {
      const storedFavorites = localStorage.getItem(`flashcard_favorites_${userId}`);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      localStorage.setItem(`flashcard_favorites_${userId}`, JSON.stringify(favorites));
    }
  }, [favorites, userId]);

  const toggleFavorite = async (deckId: string) => {
    if (favoriteService.isFavorite(favorites, deckId)) {
      setFavorites(favoriteService.removeFavorite(favorites, deckId));
      toast.success('Removed from favorites!');
    } else {
      setFavorites(favoriteService.addFavorite(favorites, deckId));
      toast.success('Added to favorites!');
    }
  };

  const isFavorite = (deckId: string): boolean => {
    return favoriteService.isFavorite(favorites, deckId);
  };

  return { favorites, toggleFavorite, isFavorite };
};
