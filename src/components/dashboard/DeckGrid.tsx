import React from 'react';
import DeckCard from './DeckCard';
import { Deck } from '@/types/deck';

interface DeckGridProps {
  decks: Deck[];
  emptyMessage?: string;
  isFollowed?: boolean;
  onDeleteDeck?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  favoritesArray?: string[];
}

const DeckGrid: React.FC<DeckGridProps> = ({ 
  decks, 
  emptyMessage = 'No decks found.',
  isFollowed = false,
  onDeleteDeck,
  onToggleFavorite,
  favoritesArray = []
}) => {
  if (decks.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {decks.map(deck => {
        const isFavorite = favoritesArray.includes(deck.id);
        
        return (
          <DeckCard 
            key={deck.id} 
            deck={deck} 
            isFavorite={isFavorite}
            isFollowed={isFollowed}
            onDeleteDeck={onDeleteDeck}
            onToggleFavorite={onToggleFavorite}
          />
        );
      })}
    </div>
  );
};

export default DeckGrid;
