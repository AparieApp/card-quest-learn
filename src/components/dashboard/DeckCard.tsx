
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Deck } from '@/types/deck';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import DeckOwner from './DeckOwner';

interface DeckCardProps {
  deck: Deck;
  isFavorite?: boolean;
  isFollowed?: boolean;
  onDeleteDeck?: (id: string) => void;
}

const DeckCard = ({ deck, isFavorite = false, isFollowed = false }: DeckCardProps) => {
  const navigate = useNavigate();
  const cardCount = deck.cards ? deck.cards.length : 0;
  const lastUpdated = formatDistanceToNow(new Date(deck.updated_at), { addSuffix: true });

  const handleClick = () => {
    navigate(`/deck/${deck.id}`);
  };

  return (
    <Card className="overflow-hidden hover:border-flashcard-primary transition-all duration-200 cursor-pointer" onClick={handleClick}>
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1 text-lg">{deck.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm line-clamp-2 min-h-[2.5rem]">
          {deck.description || "No description"}
        </p>
        <div className="flex flex-col gap-2 mt-4">
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="text-xs">
              {cardCount} {cardCount === 1 ? 'card' : 'cards'}
            </Badge>
            {isFavorite && (
              <Badge className="bg-red-500 text-white hover:bg-red-600 text-xs">
                Favorite
              </Badge>
            )}
            {isFollowed && (
              <Badge className="bg-blue-500 text-white hover:bg-blue-600 text-xs">
                Following
              </Badge>
            )}
          </div>
          <DeckOwner creatorId={deck.creator_id} className="mt-1" />
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-3 text-xs text-muted-foreground">
        <div className="w-full flex justify-between">
          <span>Updated {lastUpdated}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DeckCard;
