
import { Button } from "@/components/ui/button";
import { Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Deck } from "@/types/deck";

interface SharingButtonsProps {
  deck: Deck;
  isCopying: boolean;
  onCopy: () => Promise<void>;
}

export const SharingButtons = ({ deck, isCopying, onCopy }: SharingButtonsProps) => {
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
        onClick={() => {
          const shareUrl = window.location.href;
          navigator.clipboard.writeText(shareUrl);
          toast.success('Share link copied to clipboard');
        }}
      >
        <Share2 className="mr-2 h-4 w-4" /> 
        Share This Deck
      </Button>
    </div>
  );
};
