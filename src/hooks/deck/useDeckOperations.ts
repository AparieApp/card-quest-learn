
import { Deck, CreateDeckInput, UpdateDeckInput, CreateCardInput, UpdateCardInput } from '@/types/deck';
import { deckService } from '@/services/deckService';
import { toast } from 'sonner';

export const useDeckOperations = (
  setDecks: React.Dispatch<React.SetStateAction<Deck[]>>,
  userId?: string
) => {
  const createDeck = async (input: CreateDeckInput): Promise<Deck> => {
    if (!userId) {
      console.error('Cannot create deck: User ID is undefined', { userId });
      throw new Error('User not authenticated');
    }
    
    console.log('Creating deck with user ID:', userId);
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
    if (!id) return null;
    
    // We can't directly get the deck from setDecks since it's a state setter function
    // We need to get it from the service or use a ref to access current state
    // Since this function is used synchronously in the component to get the current deck,
    // we'll maintain access to the current decks state from the parent component
    return null; // This will be replaced by correct implementation in DeckContext
  };

  return {
    createDeck,
    updateDeck,
    deleteDeck,
    getDeck,
  };
};
