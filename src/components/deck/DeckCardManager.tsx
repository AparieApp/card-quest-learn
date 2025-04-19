
import React from 'react';
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
}

const DeckCardManager: React.FC<DeckCardManagerProps> = ({
  cards,
  onAddClick,
  onEditCard,
  onDeleteCard,
  isLoading = false,
  deckId,
}) => {
  const { refreshDecks } = useDeck();
  
  // Collect all unique answers from the deck
  const existingAnswers = Array.from(new Set(cards.flatMap(card => [
    card.correct_answer,
    ...card.incorrect_answers,
    ...card.manual_incorrect_answers || []
  ])));

  const handleRefresh = async () => {
    if (deckId) {
      console.log('Manually refreshing deck data');
      await refreshDecks();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold flex items-center gap-2">
          Cards ({cards.length})
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh cards"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button 
            onClick={onAddClick}
            className="bg-flashcard-primary hover:bg-flashcard-secondary"
            disabled={isLoading}
          >
            <Plus className="mr-1 h-4 w-4" /> Add Card
          </Button>
        </div>
      </div>
      
      <CardList
        cards={cards}
        onEdit={onEditCard}
        onDelete={onDeleteCard}
        isLoading={isLoading}
        existingAnswers={existingAnswers}
      />
    </div>
  );
};

export default DeckCardManager;
