import { useCallback } from 'react';
import { CreateCardInput, Flashcard } from '@/types/deck';
import { DecksUpdater, OptimisticUpdateState } from '@/types/cardOperations';
import { deckService } from '@/services/deckService';
import { toast } from 'sonner';
import { handleError } from '@/utils/errorHandling';

export const useAddCard = (
  setDecks: DecksUpdater,
  userId?: string,
  onOperationComplete?: () => void,
  optimisticState?: OptimisticUpdateState
) => {
  return useCallback(async (deckId: string, card: CreateCardInput) => {
    if (!userId) {
      console.error('Cannot add card: User not authenticated');
      toast.error('You must be logged in to add cards');
      throw new Error('User not authenticated');
    }
    
    console.log('Starting addCardToDeck operation with data:', card);
    console.log('Manual incorrect answers being sent:', card.manual_incorrect_answers);
    
    if (optimisticState) {
      optimisticState.setOptimisticUpdatingWithTimeout(true);
      optimisticState.setIsThrottlingPaused(true);
    }
    
    const optimisticCard = {
      id: crypto.randomUUID(),
      deck_id: deckId,
      created_at: new Date().toISOString(),
      ...card
    };

    try {
      console.log('Applying optimistic update with card:', optimisticCard);
      setDecks(prev => 
        prev.map(deck => 
          deck.id === deckId 
            ? { 
                ...deck, 
                cards: [...deck.cards, optimisticCard],
                updated_at: new Date().toISOString() 
              } 
            : deck
        )
      );

      const cardToSave = {
        front_text: card.front_text,
        question_image_url: card.question_image_url,
        correct_answer: card.correct_answer,
        incorrect_answers: [...(card.incorrect_answers || [])],
        manual_incorrect_answers: [...(card.manual_incorrect_answers || [])]
      };
      
      console.log('Card data prepared for saving:', cardToSave);
      
      const newCard = await deckService.addCard(deckId, cardToSave);
      
      console.log('Card saved successfully:', newCard);
      console.log('Saved manual incorrect answers:', newCard.manual_incorrect_answers);
      
      setDecks(prev => 
        prev.map(deck => 
          deck.id === deckId 
            ? { 
                ...deck, 
                cards: deck.cards.map(c => 
                  c.id === optimisticCard.id ? newCard : c
                ),
                updated_at: new Date().toISOString()
              } 
            : deck
        )
      );

      toast.success('Card added successfully!');
      
      if (onOperationComplete) {
        console.log('Calling operation complete callback');
        await onOperationComplete();
      }

      return newCard;
    } catch (error) {
      console.error('Error adding card:', error);
      
      setDecks(prev => 
        prev.map(deck => 
          deck.id === deckId 
            ? { 
                ...deck, 
                cards: deck.cards.filter(c => c.id !== optimisticCard.id)
              } 
            : deck
        )
      );
      
      handleError(error, 'Failed to add card');
      throw error;
    } finally {
      if (optimisticState) {
        optimisticState.setOptimisticUpdatingWithTimeout(false);
        optimisticState.clearOptimisticTimeout();
        
        setTimeout(() => {
          optimisticState.setIsThrottlingPaused(false);
          console.log('Throttling restored after card operation');
        }, 1000);
      }
    }
  }, [userId, setDecks, onOperationComplete, optimisticState]);
};
