
import { supabase } from "@/integrations/supabase/client";
import { Deck, CreateDeckInput, UpdateDeckInput } from '@/types/deck';
import { DeckMapper } from '@/mappers/DeckMapper';

export const deckOperationsService = {
  // Get all decks for a user
  async getDecks(): Promise<Deck[]> {
    const { data: decks, error } = await supabase
      .from('decks')
      .select(`
        *,
        flashcards (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return DeckMapper.toDomainList(decks);
  },

  // Get a specific deck by ID
  async getDeck(id: string): Promise<Deck | null> {
    const { data: deck, error } = await supabase
      .from('decks')
      .select(`
        *,
        flashcards (*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) return null;
    
    return deck ? DeckMapper.toDomain(deck) : null;
  },

  // Create a new deck
  async createDeck(userId: string, input: CreateDeckInput): Promise<Deck> {
    const { data, error } = await supabase
      .from('decks')
      .insert({
        creator_id: userId,
        title: input.title,
        description: input.description
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      cards: []
    };
  },

  // Update an existing deck
  async updateDeck(id: string, input: UpdateDeckInput): Promise<void> {
    const { error } = await supabase
      .from('decks')
      .update({
        title: input.title,
        description: input.description
      })
      .eq('id', id);

    if (error) throw error;
  },

  // Delete a deck
  async deleteDeck(id: string): Promise<void> {
    const { error } = await supabase
      .from('decks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
