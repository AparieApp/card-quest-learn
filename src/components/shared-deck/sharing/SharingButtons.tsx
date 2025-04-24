
import { Button } from "@/components/ui/button";
import { Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Deck } from "@/types/deck";
import { useState } from "react";

interface SharingButtonsProps {
  deck: Deck;
  isCopying: boolean;
  onCopy: () => Promise<void>;
}

export const SharingButtons = ({ deck, isCopying, onCopy }: SharingButtonsProps) => {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const shareUrl = window.location.href;
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: `FlashCards: ${deck.title}`,
            text: `Check out this flashcard deck: ${deck.title}`,
            url: shareUrl,
          });
          toast.success('Deck shared successfully');
        } catch (error: any) {
          if (error.name === 'NotAllowedError') {
            // User denied permission or not in secure context, fall back to clipboard
            await navigator.clipboard.writeText(shareUrl);
            toast.success('Share link copied to clipboard');
          } else if (error.name !== 'AbortError') {
            // Only show error if it's not a user cancellation
            console.error('Share error:', error);
            toast.error('Failed to share deck');
          }
        }
      } else {
        // Web Share API not available, use clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Share link copied to clipboard');
      }
    } catch (error) {
      console.error('Failed to share:', error);
      toast.error('Failed to share deck');
    } finally {
      setIsSharing(false);
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
        onClick={handleShare}
        disabled={isSharing}
      >
        <Share2 className="mr-2 h-4 w-4" /> 
        Share This Deck
        {isSharing && <span className="ml-2 animate-spin">⟳</span>}
      </Button>
    </div>
  );
};
