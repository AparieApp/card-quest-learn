
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
      
      // Check if Web Share API is available AND running in secure context
      if (navigator.share && window.isSecureContext) {
        try {
          await navigator.share({
            title: `FlashCards: ${deck.title}`,
            text: `Check out this flashcard deck: ${deck.title}`,
            url: shareUrl,
          });
          toast.success('Deck shared successfully');
        } catch (error: any) {
          console.log('Share API error:', error);
          // If user cancels or permission denied, fall back to clipboard
          if (error.name !== 'AbortError') {
            await navigator.clipboard.writeText(shareUrl);
            toast.success('Share link copied to clipboard');
          }
        }
      } else {
        // Web Share API not available, use clipboard instead
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
