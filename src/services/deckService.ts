
import { supabase } from "@/integrations/supabase/client";
import { Deck, CreateDeckInput, UpdateDeckInput, CreateCardInput, UpdateCardInput, Flashcard } from '@/types/deck';

export const deckService = {
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
    
    return decks.map(deck => ({
      ...deck,
      cards: (deck.flashcards || []).map(card => ({
        ...card,
        manual_incorrect_answers: card.manual_incorrect_answers || [] 
      }))
    }));
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
    
    return deck ? {
      ...deck,
      cards: (deck.flashcards || []).map(card => ({
        ...card,
        manual_incorrect_answers: card.manual_incorrect_answers || []
      }))
    } : null;
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
  },

  // Add a card to a deck
  async addCard(deckId: string, cardData: CreateCardInput): Promise<Flashcard> {
    const { data, error } = await supabase
      .from('flashcards')
      .insert({
        deck_id: deckId,
        front_text: cardData.front_text,
        correct_answer: cardData.correct_answer,
        incorrect_answers: cardData.incorrect_answers,
        manual_incorrect_answers: cardData.manual_incorrect_answers || []
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      manual_incorrect_answers: data.manual_incorrect_answers || []
    };
  },

  // Update a card in a deck
  async updateCard(cardId: string, cardData: UpdateCardInput): Promise<void> {
    const { error } = await supabase
      .from('flashcards')
      .update({
        front_text: cardData.front_text,
        correct_answer: cardData.correct_answer,
        incorrect_answers: cardData.incorrect_answers,
        manual_incorrect_answers: cardData.manual_incorrect_answers || []
      })
      .eq('id', cardId);

    if (error) throw error;
  },

  // Delete a card from a deck
  async deleteCard(cardId: string): Promise<void> {
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', cardId);

    if (error) throw error;
  },

  // Copy a deck (used for saving shared decks)
  async copyDeck(userId: string, sourceDeckId: string): Promise<Deck> {
    // First, get the source deck
    const sourceDeck = await this.getDeck(sourceDeckId);
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
