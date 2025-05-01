import { Button } from "@/components/ui/button";
import { Copy, BookmarkPlus, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Deck } from "@/types/deck";
import { useState } from "react";
import { useFollowedDecks } from "@/hooks/useFollowedDecks";

interface SharingButtonsProps {
  deck: Deck;
  isCopying: boolean;
  onCopy: () => Promise<void>;
  isFollowing: boolean;
  onFollow: () => Promise<void>;
}

export const SharingButtons = ({ 
  deck, 
  isCopying, 
  onCopy,
  isFollowing, 
  onFollow 
}: SharingButtonsProps) => {
  const [isFollowingDeck, setIsFollowingDeck] = useState(false);

  const handleFollow = async () => {
    setIsFollowingDeck(true);
    try {
      await onFollow();
    } catch (error) {
      console.error('Failed to follow deck:', error);
    } finally {
      setIsFollowingDeck(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        variant="outline" 
        className="w-full justify-start"
        onClick={onCopy}
        disabled={isCopying}
      >
        <Copy className="mr-2 h-4 w-4" /> 
        Save to My Decks
        {isCopying && <span className="ml-2 animate-spin">⟳</span>}
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full justify-start"
        onClick={handleFollow}
        disabled={isFollowingDeck || isFollowing}
      >
        <BookmarkPlus className="mr-2 h-4 w-4" /> 
        {isFollowing ? 'Following Deck' : 'Follow Deck'}
        {isFollowingDeck && <span className="ml-2 animate-spin">⟳</span>}
      </Button>
    </div>
  );
};
