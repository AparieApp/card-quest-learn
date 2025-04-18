
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { Deck } from '@/types/deck';

interface SharedDeckDetailsProps {
  deck: Deck;
  isFavorite: boolean;
  isAuthenticated: boolean;
  onFavorite: () => void;
}

export const SharedDeckDetails = ({
  deck,
  isFavorite,
  isAuthenticated,
  onFavorite,
}: SharedDeckDetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{deck.title}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-8 w-8" 
            onClick={onFavorite}
          >
            <Heart 
              className={`h-5 w-5 ${isAuthenticated && isFavorite ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`} 
            />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{deck.description || 'No description provided.'}</p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{deck.cards.length} cards</span>
          <span>Created {new Date(deck.created_at).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};
