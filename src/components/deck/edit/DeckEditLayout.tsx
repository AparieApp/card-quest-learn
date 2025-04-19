
import React from 'react';
import DeckEditForm from '@/components/deck/DeckEditForm';
import DeckCardManager from '@/components/deck/DeckCardManager';
import { Deck } from '@/types/deck';

interface DeckEditLayoutProps {
  deck: Deck;
  title: string;
  description: string;
  isSaving: boolean;
  isLoading: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSaveDeck: () => void;
  onAddCard: () => void;
  onEditCard: (cardId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onRefreshRequest: () => Promise<void>;
}

const DeckEditLayout: React.FC<DeckEditLayoutProps> = ({
  deck,
  title,
  description,
  isSaving,
  isLoading,
  onTitleChange,
  onDescriptionChange,
  onSaveDeck,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onRefreshRequest
}) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <DeckEditForm
        title={title}
        description={description}
        isSaving={isSaving}
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
        onSave={onSaveDeck}
      />
      
      <DeckCardManager
        cards={deck.cards}
        onAddClick={onAddCard}
        onEditCard={onEditCard}
        onDeleteCard={onDeleteCard}
        isLoading={isLoading}
        deckId={deck.id}
        onRefreshRequest={onRefreshRequest}
      />
    </div>
  );
};

export default DeckEditLayout;
