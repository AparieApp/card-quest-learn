import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Deck } from '@/types/deck';
import { useNavigate } from 'react-router-dom';
import { Heart, Edit, Trash, Share2, PlayCircle, ClipboardCheck, Bookmark, ExternalLink } from 'lucide-react';
import { useDeck } from '@/context/DeckContext';
import { useFollowedDecks } from '@/hooks/useFollowedDecks';
import { followedDeckService } from '@/services/followedDeckService';

interface DeckCardProps {
  deck: Deck;
  isFollowed?: boolean;
}

const DeckCard: React.FC<DeckCardProps> = ({ deck, isFollowed = false }) => {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite, deleteDeck } = useDeck();
  const { unfollowDeck } = useFollowedDecks();
  const [shareCode, setShareCode] = useState<string | null>(null);
  
  useEffect(() => {
    // If this is a followed deck, get the share code
    if (isFollowed) {
      const getShareCode = async () => {
        const code = await followedDeckService.getShareCodeForDeck(deck.id);
        setShareCode(code);
      };
      getShareCode();
    }
  }, [isFollowed, deck.id]);
  
  const handlePlay = () => {
    if (isFollowed) {
      if (shareCode) {
        navigate(`/shared/${shareCode}/practice`);
      } else {
        navigate(`/deck/${deck.id}/practice`);
      }
    } else {
      navigate(`/deck/${deck.id}/practice`);
    }
  };
  
  const handleTest = () => {
    if (isFollowed) {
      if (shareCode) {
        navigate(`/shared/${shareCode}/test`);
      } else {
        navigate(`/deck/${deck.id}/test`);
      }
    } else {
      navigate(`/deck/${deck.id}/test`);
    }
  };
  
  const handleEdit = () => {
    navigate(`/deck/${deck.id}`);
  };
  
  const handleShare = () => {
    navigate(`/deck/${deck.id}/share`);
  };
  
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    toggleFavorite(deck.id);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (confirm('Are you sure you want to delete this deck?')) {
      deleteDeck(deck.id);
    }
  };

  const handleUnfollow = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (confirm('Are you sure you want to unfollow this deck?')) {
      unfollowDeck(deck.id);
    }
  };

  return (
    <Card className="h-full cursor-pointer hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span className="text-lg line-clamp-1">{deck.title}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-8 w-8" 
            onClick={handleToggleFavorite}
          >
            <Heart 
              className={`h-5 w-5 ${isFavorite(deck.id) ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`} 
            />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent 
        className="pb-2"
        onClick={handlePlay}
      >
        <p className="text-muted-foreground text-sm line-clamp-2">
          {isFollowed ? (
            <span className="flex items-center gap-1">
              <Bookmark className="h-3 w-3" />
              Followed deck {deck.description ? `• ${deck.description}` : `• ${deck.cards.length} cards`}
            </span>
          ) : (
            deck.description || `${deck.cards.length} cards`
          )}
        </p>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePlay}>
            <PlayCircle className="h-4 w-4 mr-1" />
            Practice
          </Button>
          <Button variant="outline" size="sm" onClick={handleTest}>
            <ClipboardCheck className="h-4 w-4 mr-1" />
            Test
          </Button>
        </div>
        <div className="flex gap-1">
          {isFollowed ? (
            <>
              <Button variant="ghost" size="sm" className="p-2 h-8 w-8" onClick={handleUnfollow}>
                <Bookmark className="h-4 w-4 text-muted-foreground" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="p-2 h-8 w-8" onClick={handleEdit}>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 h-8 w-8" onClick={handleShare}>
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 h-8 w-8" onClick={handleDelete}>
                <Trash className="h-4 w-4 text-muted-foreground" />
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default DeckCard;
