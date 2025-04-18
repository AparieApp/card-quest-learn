
import { useState } from 'react';
import { useDeck } from '@/context/DeckContext';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
import { CreateDeckInput } from '@/types/deck';

export const useCreateDeck = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { createDeck } = useDeck();
  const { isAuthenticated, user } = useAuth();

  const handleCreateDeck = async (input: CreateDeckInput) => {
    // Log auth state for debugging
    console.log('Auth state when creating deck:', { isAuthenticated, userId: user?.id });
    
    if (!isAuthenticated || !user) {
      toast.error('You must be logged in to create a deck');
      return null;
    }

    setIsCreating(true);
    try {
      // Log the input for debugging purposes
      console.log('Creating deck with input:', input);
      const newDeck = await createDeck(input);
      toast.success('Deck created successfully!');
      return newDeck;
    } catch (error) {
      console.error('Error creating deck:', error);
      toast.error('Failed to create deck. Please try again.');
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    handleCreateDeck,
    isCreating
  };
};
