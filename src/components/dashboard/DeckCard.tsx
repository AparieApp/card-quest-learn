import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Deck } from '@/types/deck';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { BookOpen, Play, Edit, Share2, Trash2, Heart } from 'lucide-react';
import DeckOwner from './DeckOwner';
import { useIsMobile } from '@/hooks/use-mobile';

interface DeckCardProps {
  deck: Deck;
  isFavorite?: boolean;
  isFollowed?: boolean;
  onDeleteDeck?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
}

const DeckCard = ({ deck, isFavorite = false, isFollowed = false, onDeleteDeck, onToggleFavorite }: DeckCardProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
    <Card className="overflow-hidden hover:border-flashcard-primary transition-all duration-200 cursor-pointer hover-touch group" onClick={handleClick}>
      <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
        {/* Left part of header: Title and Card Count */}
        <div className="flex-grow min-w-0 pr-2">
          <div className="flex items-start gap-2 mb-1">
            <CardTitle className="line-clamp-2 text-base sm:text-lg leading-tight">
              {deck.title}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs h-5 flex items-center whitespace-nowrap">
              {cardCount} {cardCount === 1 ? 'card' : 'cards'}
            </Badge>
          </div>
        </div>
        
        {/* Right part of header: Favorite Button */}
        {onToggleFavorite && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleToggleFavorite} 
            className="btn-mobile-optimized hover:bg-flashcard-primary hover:text-white transition-colors flex-shrink-0" 
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="pb-1">
        <p className="text-muted-foreground text-sm line-clamp-2 min-h-[2.5rem]">
          {deck.description || "No description"}
        </p>
      </CardContent>
      
      <CardFooter className="pt-1 pb-3">
        <div className="w-full flex flex-col gap-2">
          {/* Practice and Test buttons - more compact layout */}
          <div className={`flex gap-1.5 ${isMobile ? '' : ''}`}>
            <Button 
              variant="outline" 
              onClick={handlePractice} 
              className="hover:bg-flashcard-primary hover:text-white transition-colors btn-mobile-optimized flex-1 text-sm"
              size="sm"
            >
              <BookOpen className="h-4 w-4 mr-1.5" />
              Practice
            </Button>
            <Button 
              variant="outline" 
              onClick={handleTest}
              className="hover:bg-flashcard-primary hover:text-white transition-colors btn-mobile-optimized flex-1 text-sm"
              size="sm"
            >
              <Play className="h-4 w-4 mr-1.5" />
              Test
            </Button>
          </div>
          
          {/* Action buttons - more compact */}
          <div className="flex items-center justify-end gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleShare} 
              className="btn-mobile-optimized hover:bg-flashcard-primary hover:text-white transition-colors h-8 px-2"
              title="Share"
            >
              <Share2 className="h-3.5 w-3.5" />
            </Button>
            {onDeleteDeck && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={e => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete this deck? This action cannot be undone.')) {
                    if (window.confirm('Please confirm again: Delete this deck permanently?')) {
                      onDeleteDeck(deck.id);
                    }
                  }
                }}
                className="btn-mobile-optimized hover:bg-red-500 hover:text-white transition-colors h-8 px-2"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DeckCard;
