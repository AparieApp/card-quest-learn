import { supabase } from "@/integrations/supabase/client";
import { Deck, CreateDeckInput, UpdateDeckInput } from '@/types/deck';
import { DeckMapper } from '@/mappers/DeckMapper';
import { isValidUUID, sanitizeText } from '@/utils/secureValidation';
import { ValidationError, DataError } from '@/utils/errorHandling';

// Helper function to extract file path from Supabase storage URL
// (This can be moved to a shared utility file if used in multiple service files)
const getFilePathFromUrl = (url: string): string | null => {
  try {
    const urlObject = new URL(url);
    const pathSegments = urlObject.pathname.split('/');
    const bucketName = 'flashcard-images'; // Ensure this is your correct bucket name
    const bucketNameIndex = pathSegments.indexOf(bucketName);

    if (bucketNameIndex === -1 || bucketNameIndex + 1 >= pathSegments.length) {
      console.warn('Could not determine file path from URL. Bucket or file path segment not found:', url);
      return null;
    }
    return pathSegments.slice(bucketNameIndex + 1).join('/');
  } catch (error) {
    console.error('Error parsing Supabase storage URL:', url, error);
    return null;
  }
};

export const deckOperationsService = {
  async getDecks(): Promise<Deck[]> {
    try {
      const { data: decks, error } = await supabase
        .from('decks')
        .select(`
          *,\n          flashcards (*)\n        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching decks:', error);
        throw new DataError('Failed to fetch decks');
      }
      return DeckMapper.toDomainList(decks);
    } catch (error) {
      console.error('Error in getDecks:', error);
      if (error instanceof DataError) throw error;
      throw new DataError('Failed to fetch decks');
    }
  },

  async getDeck(id: string): Promise<Deck | null> {
    try {
      if (!id || !isValidUUID(id)) {
        throw new ValidationError('Invalid deck ID');
      }
      const { data: deck, error } = await supabase
        .from('decks')
        .select(`
          *,\n          flashcards (*)\n        `)
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
      return { ...data, cards: [] }; // Assuming new deck has no cards initially
    } catch (error) {
      console.error('Error in createDeck:', error);
      if (error instanceof ValidationError || error instanceof DataError) throw error;
      throw new DataError('Failed to create deck');
    }
  },

  async updateDeck(id: string, input: UpdateDeckInput): Promise<void> {
    try {
      if (!id || !isValidUUID(id)) {
        throw new ValidationError('Invalid deck ID');
      }
      const updateData: Partial<UpdateDeckInput> = {};
      if (input.title !== undefined) updateData.title = sanitizeText(input.title);
      if (input.description !== undefined) updateData.description = sanitizeText(input.description);
      
      if (Object.keys(updateData).length === 0) {
        console.log("No valid fields to update for deck:", id);
        return;
      }

      const { error } = await supabase
        .from('decks')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating deck:', error);
        throw new DataError('Failed to update deck');
      }
    } catch (error) {
      console.error('Error in updateDeck:', error);
      if (error instanceof ValidationError || error instanceof DataError) throw error;
      throw new DataError('Failed to update deck');
    }
  },

  async deleteDeck(deckId: string): Promise<void> {
    try {
      if (!deckId || !isValidUUID(deckId)) {
        throw new ValidationError('Invalid deck ID for deletion');
      }
      console.log(`Starting deletion process for deck ID: ${deckId}`);

      // 1. Fetch all cards associated with the deck
      const { data: cards, error: fetchCardsError } = await supabase
        .from('flashcards')
        .select('id, question_image_url')
        .eq('deck_id', deckId);

      if (fetchCardsError) {
        console.error(`Error fetching cards for deck ${deckId}:`, fetchCardsError.message);
        throw new DataError(`Failed to fetch cards for deck deletion: ${fetchCardsError.message}`);
      }

      // 2. Collect file paths and attempt to delete images from storage
      if (cards && cards.length > 0) {
        const filePathsToDelete: string[] = cards
          .map(card => card.question_image_url ? getFilePathFromUrl(card.question_image_url) : null)
          .filter((path): path is string => path !== null);

        if (filePathsToDelete.length > 0) {
          console.log(`Attempting to delete ${filePathsToDelete.length} images from storage for deck ${deckId}.`);
          const { data: storageDeleteData, error: storageError } = await supabase.storage
            .from('flashcard-images')
            .remove(filePathsToDelete);

          if (storageError) {
            console.error(`Error deleting images from Supabase Storage for deck ${deckId}:`, storageError.message);
            // Log error but continue. The primary concern is deleting DB records.
          } else {
            console.log(`Successfully deleted images from storage for deck ${deckId}. Items processed:`, storageDeleteData?.length || 0);
          }
        }

        // 3. Delete all card records for the deck.
        // This is crucial if ON DELETE CASCADE is not set on the flashcards.deck_id foreign key.
        // If it is set, this operation might be redundant or could be skipped,
        // but performing it ensures cards are deleted if the FK constraint isn't there or fails.
        console.log(`Attempting to delete ${cards.length} card records for deck ${deckId}.`);
        const { error: deleteCardsError } = await supabase
          .from('flashcards')
          .delete()
          .eq('deck_id', deckId);

        if (deleteCardsError) {
          console.error(`Error deleting card records for deck ${deckId}:`, deleteCardsError.message);
          throw new DataError(`Failed to delete card records for deck: ${deleteCardsError.message}`);
        }
        console.log(`Successfully deleted card records for deck ${deckId}.`);
      } else {
        console.log(`No cards found for deck ${deckId} to delete.`);
      }

      // 4. Delete the deck record itself
      console.log(`Attempting to delete deck record for ID: ${deckId}`);
      const { error: deleteDeckError } = await supabase
        .from('decks')
        .delete()
        .eq('id', deckId);

      if (deleteDeckError) {
        console.error(`Error deleting deck record ${deckId}:`, deleteDeckError.message);
        throw new DataError(`Failed to delete deck record: ${deleteDeckError.message}`);
      }
      console.log(`Successfully deleted deck record ${deckId}.`);

    } catch (error) {
      console.error(`Overall error in deleteDeck service for deck ID ${deckId}:`, (error as Error).message);
      if (error instanceof ValidationError || error instanceof DataError) {
        throw error;
      }
      throw new DataError('An unexpected error occurred while deleting the deck.');
    }
  }
};
