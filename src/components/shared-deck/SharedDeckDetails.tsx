
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, User } from 'lucide-react';
import { Deck } from '@/types/deck';
import { getUsernameById } from '@/utils/userUtils';

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
  const [creatorName, setCreatorName] = useState('Unknown Creator');
  
  useEffect(() => {
    const loadCreator = async () => {
      if (deck.creator_id) {
        const username = await getUsernameById(deck.creator_id);
        setCreatorName(username);
      }
    };
    
    loadCreator();
  }, [deck.creator_id]);
  
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
            disabled={!isAuthenticated}
            title={!isAuthenticated ? "Log in to favorite this deck" : (isFavorite ? "Remove from favorites" : "Add to favorites")}
          >
            <Heart 
              className={`h-5 w-5 ${isAuthenticated && isFavorite ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`} 
            />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{deck.description || 'No description provided.'}</p>
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Created by {creatorName}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{deck.cards.length} cards</span>
            <span>Created {new Date(deck.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
