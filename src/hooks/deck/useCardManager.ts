
import { useState } from 'react';
import { Flashcard, CreateCardInput } from '@/types/deck';
import { useDeck } from '@/context/DeckContext';

export const useCardManager = (deckId: string) => {
  const { addCardToDeck, updateCard, deleteCard } = useDeck();
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [currentCard, setCurrentCard] = useState<Flashcard | undefined>(undefined);

  const handleAddCard = (cardData: Omit<Flashcard, 'id' | 'created_at'>) => {
    const cardInput: CreateCardInput = {
      front_text: cardData.front_text,
      correct_answer: cardData.correct_answer,
      incorrect_answers: cardData.incorrect_answers
    };
    addCardToDeck(deckId, cardInput);
    setIsCardDialogOpen(false);
    setCurrentCard(undefined);
  };

  const handleUpdateCard = (cardData: Omit<Flashcard, 'id' | 'created_at'>) => {
    if (!currentCard) return;
    updateCard(deckId, currentCard.id, cardData);
    setIsCardDialogOpen(false);
    setCurrentCard(undefined);
  };

  const handleDeleteCard = (cardId: string) => {
    if (confirm('Are you sure you want to delete this card?')) {
      deleteCard(deckId, cardId);
    }
  };

  const handleDeleteCurrentCard = () => {
    if (!currentCard) return;
    handleDeleteCard(currentCard.id);
    setIsCardDialogOpen(false);
    setCurrentCard(undefined);
  };

  return {
    isCardDialogOpen,
    setIsCardDialogOpen,
    currentCard,
    setCurrentCard,
    handleAddCard,
    handleUpdateCard,
    handleDeleteCard,
    handleDeleteCurrentCard
  };
};
