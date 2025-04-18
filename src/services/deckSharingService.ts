
import { supabase } from "@/integrations/supabase/client";
import { Deck } from '@/types/deck';
import { deckOperationsService } from './deckOperationsService';

export const deckSharingService = {
  // Copy a deck (used for saving shared decks)
  async copyDeck(userId: string, sourceDeckId: string): Promise<Deck> {
    // First, get the source deck
    const sourceDeck = await deckOperationsService.getDeck(sourceDeckId);
    if (!sourceDeck) throw new Error('Source deck not found');

    // Create a new deck
    const { data: newDeck, error: deckError } = await supabase
      .from('decks')
      .insert({
        creator_id: userId,
        title: `${sourceDeck.title} (Copy)`,
        description: sourceDeck.description
      })
      .select()
      .single();

    if (deckError) throw deckError;

    // Copy all cards from the source deck
    if (sourceDeck.cards && sourceDeck.cards.length > 0) {
      const cardsToInsert = sourceDeck.cards.map(card => ({
        deck_id: newDeck.id,
        front_text: card.front_text,
        correct_answer: card.correct_answer,
        incorrect_answers: card.incorrect_answers,
        manual_incorrect_answers: card.manual_incorrect_answers || []
      }));

      const { data: newCards, error: cardsError } = await supabase
        .from('flashcards')
        .insert(cardsToInsert)
        .select();

      if (cardsError) throw cardsError;

      return {
        ...newDeck,
        cards: newCards.map(card => ({
          ...card,
          manual_incorrect_answers: card.manual_incorrect_answers || []
        }))
      };
    }

    return {
      ...newDeck,
      cards: []
    };
  }
};
