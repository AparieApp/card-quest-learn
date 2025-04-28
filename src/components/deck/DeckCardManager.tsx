
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, RefreshCw } from 'lucide-react';
import CardList from './CardList';
import { Flashcard } from '@/types/deck';
import { useDeck } from '@/context/DeckContext';

interface DeckCardManagerProps {
  cards: Flashcard[];
  onAddClick: () => void;
  onEditCard: (cardId: string) => void;
  onDeleteCard: (cardId: string) => void;
  isLoading?: boolean;
  deckId?: string;
  onRefreshRequest?: () => Promise<void>;
}

const DeckCardManager: React.FC<DeckCardManagerProps> = ({
  cards,
  onAddClick,
  onEditCard,
  onDeleteCard,
  isLoading = false,
  deckId,
  onRefreshRequest,
}) => {
  const { refreshDecks } = useDeck();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing || !deckId) return;
    
    setIsRefreshing(true);
    try {
      console.log('Manual refresh requested from DeckCardManager');
      if (onRefreshRequest) {
        await onRefreshRequest();
        console.log('Custom refresh handler completed');
      } else {
        // Always bypass throttling for manual refresh
        await refreshDecks(true);
        console.log('Default refresh completed');
      }
      console.log('Manual refresh completed');
    } catch (error) {
      console.error('Error during manual refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Collect all unique answers from the deck
  const existingAnswers = React.useMemo(() => {
    return Array.from(new Set(cards.flatMap(card => [
      card.correct_answer,
      ...(card.incorrect_answers || []),
      ...(card.manual_incorrect_answers || [])
    ])));
  }, [cards]);

  console.log(`Rendering DeckCardManager with ${cards.length} cards`);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold flex items-center gap-2">
          Cards ({cards.length})
          {(isLoading || isRefreshing) && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            title="Refresh cards"
            className="flex items-center justify-center min-h-[44px] min-w-[44px]" // iOS touch target size
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh cards</span>
          </Button>
          <Button 
            onClick={onAddClick}
            className="bg-flashcard-primary hover:bg-flashcard-secondary min-h-[44px]" // iOS touch target size
            disabled={isLoading || isRefreshing}
          >
            <Plus className="mr-1 h-4 w-4" /> Add Card
          </Button>
        </div>
      </div>
      
      <CardList
        cards={cards}
        onEdit={onEditCard}
        onDelete={onDeleteCard}
        isLoading={isLoading || isRefreshing}
        existingAnswers={existingAnswers}
      />
    </div>
  );
};

export default DeckCardManager;
