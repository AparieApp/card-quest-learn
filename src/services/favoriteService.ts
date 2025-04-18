
export const favoriteService = {
  addFavorite: (favorites: string[], deckId: string): string[] => {
    return [...favorites, deckId];
  },

  removeFavorite: (favorites: string[], deckId: string): string[] => {
    return favorites.filter(id => id !== deckId);
  },

  isFavorite: (favorites: string[], deckId: string): boolean => {
    return favorites.includes(deckId);
  },
};
