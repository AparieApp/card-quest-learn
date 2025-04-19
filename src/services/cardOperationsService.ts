
import { supabase } from "@/integrations/supabase/client";
import { CreateCardInput, UpdateCardInput, Flashcard } from '@/types/deck';
import { CardMapper } from '@/mappers/CardMapper';

export const cardOperationsService = {
  async addCard(deckId: string, cardData: CreateCardInput): Promise<Flashcard> {
    console.log('Adding card with data:', cardData);
    
    const { data, error } = await supabase
      .from('flashcards')
      .insert({
        deck_id: deckId,
        front_text: cardData.front_text,
        correct_answer: cardData.correct_answer,
        incorrect_answers: cardData.incorrect_answers || [],
        manual_incorrect_answers: cardData.manual_incorrect_answers || []
      })
      .select()
      .single();

    if (error) throw error;
    
    return CardMapper.toDomain(data);
  },

  async updateCard(cardId: string, cardData: UpdateCardInput): Promise<void> {
    console.log('Updating card with data:', cardData);
    
    const updateData: any = {};
    
    if (cardData.front_text !== undefined) {
      updateData.front_text = cardData.front_text;
    }
    
    if (cardData.correct_answer !== undefined) {
      updateData.correct_answer = cardData.correct_answer;
    }
    
    if (cardData.incorrect_answers !== undefined) {
      updateData.incorrect_answers = cardData.incorrect_answers;
    }
    
    if (cardData.manual_incorrect_answers !== undefined) {
      updateData.manual_incorrect_answers = cardData.manual_incorrect_answers;
    }

    console.log('Sending update data to Supabase:', updateData);
    const { error } = await supabase
      .from('flashcards')
      .update(updateData)
      .eq('id', cardId);

    if (error) {
      console.error('Supabase error updating card:', error);
      throw error;
    }
  },

  async deleteCard(cardId: string): Promise<void> {
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', cardId);

    if (error) throw error;
  }
};
