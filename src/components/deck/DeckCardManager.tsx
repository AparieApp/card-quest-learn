
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CardList from './CardList';
import { Flashcard } from '@/types/deck';

interface DeckCardManagerProps {
  cards: Flashcard[];
  onAddClick: () => void;
  onEditCard: (cardId: string) => void;
  onDeleteCard: (cardId: string) => void;
}

const DeckCardManager: React.FC<DeckCardManagerProps> = ({
  cards,
  onAddClick,
  onEditCard,
  onDeleteCard,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">Cards ({cards.length})</h2>
        <Button 
          onClick={onAddClick}
          className="bg-flashcard-primary hover:bg-flashcard-secondary"
        >
          <Plus className="mr-1 h-4 w-4" /> Add Card
        </Button>
      </div>
      
      <CardList
        cards={cards}
        onEdit={onEditCard}
        onDelete={onDeleteCard}
      />
    </div>
  );
};

export default DeckCardManager;
