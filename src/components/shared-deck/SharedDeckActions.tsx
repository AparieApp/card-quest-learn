
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  BookOpen, 
  Play, 
  Copy, 
  Share2 
} from 'lucide-react';
import { Deck } from '@/types/deck';

interface SharedDeckActionsProps {
  deck: Deck;
  isCopying: boolean;
  isAuthenticated: boolean;
  onCopy: () => Promise<void>;
}

export const SharedDeckActions = ({
  deck,
  isCopying,
  isAuthenticated,
  onCopy,
}: SharedDeckActionsProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          className="w-full justify-start bg-flashcard-primary hover:bg-flashcard-secondary"
          onClick={() => navigate(`/deck/${deck.id}/practice`)}
        >
          <BookOpen className="mr-2 h-4 w-4" /> 
          Practice Mode
          <span className="text-xs opacity-70 ml-auto">Learn at your own pace</span>
        </Button>
        
        <Button 
          className="w-full justify-start"
          onClick={() => navigate(`/deck/${deck.id}/test`)}
        >
          <Play className="mr-2 h-4 w-4" /> 
          Test Mode
          <span className="text-xs opacity-70 ml-auto">Challenge yourself</span>
        </Button>
        
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
        
        {!isAuthenticated && (
          <div className="pt-2 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Want to save this deck for later?
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/auth')}
            >
              Log in or Sign up
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
