
import { Deck, CreateDeckInput, UpdateDeckInput, CreateCardInput, UpdateCardInput } from '@/types/deck';
import { deckService } from '@/services/deckService';
import { toast } from 'sonner';

export const useDeckOperations = (
  setDecks: React.Dispatch<React.SetStateAction<Deck[]>>,
  userId?: string
) => {
  const createDeck = async (input: CreateDeckInput): Promise<Deck> => {
    if (!userId) throw new Error('User not authenticated');
    
    const newDeck = await deckService.createDeck(userId, input);
    setDecks(prev => [newDeck, ...prev]);
    toast.success(`Deck "${input.title}" created!`);
    return newDeck;
  };

  const updateDeck = async (id: string, input: UpdateDeckInput) => {
    if (!userId) throw new Error('User not authenticated');
    
    await deckService.updateDeck(id, input);
    setDecks(prev => prev.map(d => d.id === id ? { ...d, ...input, updated_at: new Date().toISOString() } : d));
    toast.success('Deck updated!');
  };

  const deleteDeck = async (id: string) => {
    if (!userId) throw new Error('User not authenticated');
    
    await deckService.deleteDeck(id);
    setDecks(prev => prev.filter(deck => deck.id !== id));
    toast.success('Deck deleted!');
  };

  const getDeck = (id: string): Deck | null => {
    return null;
  };

  return {
    createDeck,
    updateDeck,
    deleteDeck,
    getDeck,
  };
};
