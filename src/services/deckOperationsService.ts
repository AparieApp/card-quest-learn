
import { supabase } from "@/integrations/supabase/client";
import { Deck, CreateDeckInput, UpdateDeckInput } from '@/types/deck';
import { DeckMapper } from '@/mappers/DeckMapper';
import { isValidUUID, sanitizeText } from '@/utils/secureValidation';
import { ValidationError, DataError } from '@/utils/errorHandling';

export const deckOperationsService = {
  // Get all decks for a user
  async getDecks(): Promise<Deck[]> {
    try {
      // Always filter by authenticated user to ensure RLS works properly
      const { data: decks, error } = await supabase
        .from('decks')
        .select(`
          *,
          flashcards (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching decks:', error);
        throw new DataError('Failed to fetch decks');
      }
      
      return DeckMapper.toDomainList(decks);
    } catch (error) {
      console.error('Error in getDecks:', error);
      if (error instanceof DataError) {
        throw error;
      }
      throw new DataError('Failed to fetch decks');
    }
  },

  // Get a specific deck by ID
  async getDeck(id: string): Promise<Deck | null> {
    try {
      if (!id || !isValidUUID(id)) {
        throw new ValidationError('Invalid deck ID');
      }
      
      const { data: deck, error } = await supabase
        .from('decks')
        .select(`
          *,
          flashcards (*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching deck:', error);
        return null;
      }
      
      return deck ? DeckMapper.toDomain(deck) : null;
    } catch (error) {
      console.error('Error in getDeck:', error);
      return null;
    }
  },

  // Create a new deck
  async createDeck(userId: string, input: CreateDeckInput): Promise<Deck> {
    try {
      if (!userId || !isValidUUID(userId)) {
        throw new ValidationError('Invalid user ID');
      }
      
      const sanitizedTitle = sanitizeText(input.title);
      const sanitizedDescription = sanitizeText(input.description);
      
      if (!sanitizedTitle) {
        throw new ValidationError('Deck title is required');
      }

      const { data, error } = await supabase
        .from('decks')
        .insert({
          creator_id: userId,
          title: sanitizedTitle,
          description: sanitizedDescription
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating deck:', error);
        throw new DataError('Failed to create deck');
      }
      
      return {
        ...data,
        cards: []
      };
    } catch (error) {
      console.error('Error in createDeck:', error);
      if (error instanceof ValidationError || error instanceof DataError) {
        throw error;
      }
      throw new DataError('Failed to create deck');
    }
  },

  // Update an existing deck
  async updateDeck(id: string, input: UpdateDeckInput): Promise<void> {
    try {
      if (!id || !isValidUUID(id)) {
        throw new ValidationError('Invalid deck ID');
      }
      
      const sanitizedTitle = input.title ? sanitizeText(input.title) : undefined;
      const sanitizedDescription = input.description ? sanitizeText(input.description) : undefined;
      
      const { error } = await supabase
        .from('decks')
        .update({
          title: sanitizedTitle,
          description: sanitizedDescription
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating deck:', error);
        throw new DataError('Failed to update deck');
      }
    } catch (error) {
      console.error('Error in updateDeck:', error);
      if (error instanceof ValidationError || error instanceof DataError) {
        throw error;
      }
      throw new DataError('Failed to update deck');
    }
  },

  // Delete a deck
  async deleteDeck(id: string): Promise<void> {
    try {
      if (!id || !isValidUUID(id)) {
        throw new ValidationError('Invalid deck ID');
      }
      
      const { error } = await supabase
        .from('decks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting deck:', error);
        throw new DataError('Failed to delete deck');
      }
    } catch (error) {
      console.error('Error in deleteDeck:', error);
      if (error instanceof ValidationError || error instanceof DataError) {
        throw error;
      }
      throw new DataError('Failed to delete deck');
    }
  }
};
