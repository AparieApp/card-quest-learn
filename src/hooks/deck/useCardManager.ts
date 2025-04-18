
import { useState } from 'react';
import { Flashcard, CreateCardInput } from '@/types/deck';
import { useDeck } from '@/context/DeckContext';

export const useCardManager = (deckId: string) => {
  const { addCardToDeck, updateCard, deleteCard } = useDeck();
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [currentCard, setCurrentCard] = useState<Flashcard | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCard = async (cardData: Omit<Flashcard, 'id' | 'created_at' | 'deck_id'>) => {
    setIsSubmitting(true);
    try {
      const cardInput: CreateCardInput = {
        front_text: cardData.front_text,
        correct_answer: cardData.correct_answer,
        incorrect_answers: cardData.incorrect_answers
      };
      await addCardToDeck(deckId, cardInput);
      setIsCardDialogOpen(false);
      setCurrentCard(undefined);
    } catch (error) {
      console.error('Error adding card:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCard = async (cardData: Omit<Flashcard, 'id' | 'created_at' | 'deck_id'>) => {
    if (!currentCard) return;
    
    setIsSubmitting(true);
    try {
      await updateCard(deckId, currentCard.id, cardData);
      setIsCardDialogOpen(false);
      setCurrentCard(undefined);
    } catch (error) {
      console.error('Error updating card:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (confirm('Are you sure you want to delete this card?')) {
      try {
        await deleteCard(deckId, cardId);
      } catch (error) {
        console.error('Error deleting card:', error);
      }
    }
  };

  const handleDeleteCurrentCard = async () => {
    if (!currentCard) return;
    
    setIsSubmitting(true);
    try {
      await handleDeleteCard(currentCard.id);
      setIsCardDialogOpen(false);
      setCurrentCard(undefined);
    } catch (error) {
      console.error('Error deleting current card:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isCardDialogOpen,
    setIsCardDialogOpen,
    currentCard,
    setCurrentCard,
    handleAddCard,
    handleUpdateCard,
    handleDeleteCard,
    handleDeleteCurrentCard,
    isSubmitting
  };
};
