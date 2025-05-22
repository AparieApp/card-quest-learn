import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Deck } from '@/types/deck';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { BookOpen, Play, Edit, Share2, Trash2, Heart } from 'lucide-react';
import DeckOwner from './DeckOwner';

interface DeckCardProps {
  deck: Deck;
  isFavorite?: boolean;
  isFollowed?: boolean;
  onDeleteDeck?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
}

const DeckCard = ({ deck, isFavorite = false, isFollowed = false, onDeleteDeck, onToggleFavorite }: DeckCardProps) => {
  const navigate = useNavigate();
  const cardCount = deck.cards ? deck.cards.length : 0;
  const lastUpdated = formatDistanceToNow(new Date(deck.updated_at), { addSuffix: true });

  const handleClick = (e: React.MouseEvent) => {
    // Only navigate if the click wasn't on a button
    if (!(e.target as HTMLElement).closest('button')) {
      navigate(`/deck/${deck.id}`);
    }
  };

  const handlePractice = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/deck/${deck.id}/practice`);
  };

  const handleTest = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/deck/${deck.id}/test`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/deck/${deck.id}`);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/deck/${deck.id}/share`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteDeck && window.confirm('Are you sure you want to delete this deck?')) {
      onDeleteDeck(deck.id);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(deck.id);
    }
  };

  return (
    <Card className="overflow-hidden hover:border-flashcard-primary transition-all duration-200 cursor-pointer" onClick={handleClick}>
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        {/* Left part of header: Title and Card Count */}
        <div className="flex-grow">
          <div className="flex items-center gap-2">
            <CardTitle className="line-clamp-1 text-lg">{deck.title}</CardTitle>
            <Badge variant="outline" className="text-xs h-5 flex items-center whitespace-nowrap">{cardCount} {cardCount === 1 ? 'card' : 'cards'}</Badge>
          </div>
        </div>
        {/* Right part of header: Favorite Button */}
        {onToggleFavorite && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleToggleFavorite} 
            className="hover:bg-flashcard-primary hover:text-white transition-colors ml-2 -mt-1 -mr-1 flex-shrink-0" // Adjusted margin for alignment
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
          </Button>
        )}
      </CardHeader>
      <CardContent className="pb-1">
        <p className="text-muted-foreground text-sm line-clamp-2 min-h-[2.5rem]">
          {deck.description || "No description"}
        </p>
      </CardContent>
      <CardFooter className="pt-1 pb-2">
        <div className="w-full flex flex-wrap items-center justify-between gap-2">
          {/* Left: Practice/Test */}
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <Button 
              variant="outline" 
              onClick={handlePractice} 
              className="hover:bg-flashcard-primary hover:text-white transition-colors"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Practice
            </Button>
            <Button 
              variant="outline" 
              onClick={handleTest}
              className="hover:bg-flashcard-primary hover:text-white transition-colors"
            >
              <Play className="h-4 w-4 mr-2" />
              Test
            </Button>
          </div>
          {/* Right: Share/Delete (Favorite button moved to header) */}
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleShare} 
              className="hover:bg-flashcard-primary hover:text-white transition-colors"
              title="Share"
            >
              <Share2 className="h-5 w-5" />
            </Button>
            {onDeleteDeck && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={e => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete this deck? This action cannot be undone.')) {
                    if (window.confirm('Please confirm again: Delete this deck permanently?')) {
                      onDeleteDeck(deck.id);
                    }
                  }
                }}
                className="hover:bg-flashcard-primary hover:text-white transition-colors"
                title="Delete"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DeckCard;
