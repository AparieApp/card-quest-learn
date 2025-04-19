
import { useState, useCallback, useRef } from 'react';
import { Deck, CreateCardInput, UpdateCardInput } from '@/types/deck';
import { deckService } from '@/services/deckService';
import { toast } from 'sonner';
import { handleError } from '@/utils/errorHandling';

type DecksUpdater = (updater: (prevDecks: Deck[]) => Deck[]) => void;

export const useCardOperations = (
  setDecks: DecksUpdater,
  userId?: string
) => {
  const [isOptimisticUpdating, setIsOptimisticUpdating] = useState(false);
  const optimisticTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const clearOptimisticTimeout = () => {
    if (optimisticTimeoutRef.current) {
      clearTimeout(optimisticTimeoutRef.current);
      optimisticTimeoutRef.current = null;
    }
  };
  
  const setOptimisticUpdatingWithTimeout = (value: boolean) => {
    clearOptimisticTimeout();
    setIsOptimisticUpdating(value);
    
    if (value) {
      // Set a safety timeout to ensure isOptimisticUpdating gets reset
      optimisticTimeoutRef.current = setTimeout(() => {
        console.log('Safety timeout: Resetting isOptimisticUpdating');
        setIsOptimisticUpdating(false);
      }, 5000); // 5 second safety timeout
    }
  };

  console.log('Card operation started with userId:', userId);

  const addCardToDeck = useCallback(async (deckId: string, card: CreateCardInput) => {
    if (!userId) {
      console.error('Cannot add card: User not authenticated');
      toast.error('You must be logged in to add cards');
      throw new Error('User not authenticated');
    }
    
    setOptimisticUpdatingWithTimeout(true);
    console.log('Adding card to deck:', deckId);
    
    const optimisticCard = {
      id: crypto.randomUUID(),
      deck_id: deckId,
      created_at: new Date().toISOString(),
      ...card,
    };

    try {
      // Apply optimistic update
      console.log('Applying optimistic update');
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

      console.log('Optimistic update applied, calling API');
      const newCard = await deckService.addCard(deckId, card);
      console.log('Server response received for new card:', newCard.id);
      
      // Update with the actual server data
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
      
      console.log('Card added successfully');
      toast.success('Card added successfully!');
    } catch (error) {
      console.error('Error adding card:', error);
      
      // Rollback the optimistic update
      console.log('Rolling back optimistic update');
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
    } finally {
      clearOptimisticTimeout();
      setIsOptimisticUpdating(false);
      console.log('Card operation completed, isOptimisticUpdating set to false');
    }
  }, [userId, setDecks]);

  const updateCard = useCallback(async (deckId: string, cardId: string, cardData: UpdateCardInput) => {
    if (!userId) {
      console.error('Cannot update card: User not authenticated');
      toast.error('You must be logged in to update cards');
      throw new Error('User not authenticated');
    }
    
    setOptimisticUpdatingWithTimeout(true);
    console.log('Updating card:', cardId, 'in deck:', deckId);
    
    const originalDeckState = useRef<Deck[] | null>(null);
    
    try {
      // Store original state for potential rollback
      setDecks(prev => {
        originalDeckState.current = [...prev];
        
        // Apply optimistic update
        return prev.map(deck => 
          deck.id === deckId 
            ? { 
                ...deck, 
                cards: deck.cards.map(card => 
                  card.id === cardId 
                    ? { ...card, ...cardData }
                    : card
                ),
                updated_at: new Date().toISOString()
              } 
            : deck
        );
      });

      console.log('Optimistic update applied, calling API');
      await deckService.updateCard(cardId, cardData);
      console.log('Card updated successfully on server');
      toast.success('Card updated successfully!');
    } catch (error) {
      console.error('Error updating card:', error);
      
      // Rollback optimistic update
      if (originalDeckState.current) {
        console.log('Rolling back optimistic update');
        setDecks(() => originalDeckState.current!);
      }
      
      handleError(error, 'Failed to update card');
    } finally {
      clearOptimisticTimeout();
      setIsOptimisticUpdating(false);
      console.log('Card update operation completed');
    }
  }, [userId, setDecks]);

  const deleteCard = useCallback(async (deckId: string, cardId: string) => {
    if (!userId) {
      console.error('Cannot delete card: User not authenticated');
      toast.error('You must be logged in to delete cards');
      throw new Error('User not authenticated');
    }
    
    setOptimisticUpdatingWithTimeout(true);
    console.log('Deleting card:', cardId, 'from deck:', deckId);
    
    const originalDeckState = useRef<Deck[] | null>(null);
    const deletedCard = useRef<any>(null);
    
    try {
      // Store original state and the card being deleted
      setDecks(prev => {
        originalDeckState.current = [...prev];
        
        const deck = prev.find(d => d.id === deckId);
        if (deck) {
          deletedCard.current = deck.cards.find(c => c.id === cardId);
        }
        
        // Apply optimistic update
        return prev.map(deck => 
          deck.id === deckId 
            ? { 
                ...deck, 
                cards: deck.cards.filter(card => card.id !== cardId),
                updated_at: new Date().toISOString()
              } 
            : deck
        );
      });

      console.log('Optimistic update applied, calling API');
      await deckService.deleteCard(cardId);
      console.log('Card deleted successfully on server');
      toast.success('Card deleted successfully!');
    } catch (error) {
      console.error('Error deleting card:', error);
      
      // Rollback optimistic update
      if (originalDeckState.current) {
        console.log('Rolling back optimistic update');
        setDecks(() => originalDeckState.current!);
      }
      
      handleError(error, 'Failed to delete card');
    } finally {
      clearOptimisticTimeout();
      setIsOptimisticUpdating(false);
      console.log('Card deletion operation completed');
    }
  }, [userId, setDecks]);

  return {
    addCardToDeck,
    updateCard,
    deleteCard,
    isOptimisticUpdating
  };
};
