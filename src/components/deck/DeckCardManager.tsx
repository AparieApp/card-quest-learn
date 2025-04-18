
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import CardList from './CardList';
import { Flashcard } from '@/types/deck';

interface DeckCardManagerProps {
  cards: Flashcard[];
  onAddClick: () => void;
  onEditCard: (cardId: string) => void;
  onDeleteCard: (cardId: string) => void;
  isLoading?: boolean;
}

const DeckCardManager: React.FC<DeckCardManagerProps> = ({
  cards,
  onAddClick,
  onEditCard,
  onDeleteCard,
  isLoading = false,
}) => {
  // Collect all unique answers from the deck
  const existingAnswers = Array.from(new Set(cards.flatMap(card => [
    card.correct_answer,
    ...card.incorrect_answers,
    ...card.manual_incorrect_answers
  ])));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold flex items-center gap-2">
          Cards ({cards.length})
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </h2>
        <Button 
          onClick={onAddClick}
          className="bg-flashcard-primary hover:bg-flashcard-secondary"
          disabled={isLoading}
        >
          <Plus className="mr-1 h-4 w-4" /> Add Card
        </Button>
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
