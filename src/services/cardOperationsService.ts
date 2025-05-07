import { supabase } from "@/integrations/supabase/client";
import { CreateCardInput, UpdateCardInput, Flashcard } from '@/types/deck';
import { CardMapper } from '@/mappers/CardMapper';

export const cardOperationsService = {
  async addCard(deckId: string, cardData: CreateCardInput): Promise<Flashcard> {
    console.log('Adding card with data:', cardData);
    console.log('Manual incorrect answers to save:', cardData.manual_incorrect_answers);
    
    // Ensure we have arrays, not undefined
    const incorrectAnswers = cardData.incorrect_answers || [];
    const manualIncorrectAnswers = cardData.manual_incorrect_answers || [];
    
    console.log('Processed incorrect_answers:', incorrectAnswers);
    console.log('Processed manual_incorrect_answers:', manualIncorrectAnswers);
    
    const { data, error } = await supabase
      .from('flashcards')
      .insert({
        deck_id: deckId,
        front_text: cardData.front_text,
        question_image_url: cardData.question_image_url,
        correct_answer: cardData.correct_answer,
        incorrect_answers: incorrectAnswers,
        manual_incorrect_answers: manualIncorrectAnswers
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error adding card:', error);
      throw error;
    }
    
    console.log('Successfully added card:', data);
    return CardMapper.toDomain(data);
  },

  async updateCard(cardId: string, cardData: UpdateCardInput): Promise<void> {
    console.log('Updating card with data:', cardData);
    console.log('Manual incorrect answers to update:', cardData.manual_incorrect_answers);
    
    const updateData: any = {};
    
    if (cardData.front_text !== undefined) {
      updateData.front_text = cardData.front_text;
    }
    
    if (cardData.correct_answer !== undefined) {
      updateData.correct_answer = cardData.correct_answer;
    }
    
    if (cardData.incorrect_answers !== undefined) {
      updateData.incorrect_answers = [...cardData.incorrect_answers];
    }
    
    if (cardData.manual_incorrect_answers !== undefined) {
      updateData.manual_incorrect_answers = [...cardData.manual_incorrect_answers];
    }

    if (cardData.question_image_url !== undefined) {
      updateData.question_image_url = cardData.question_image_url;
    }

    console.log('Final update data being sent to Supabase:', updateData);

    const { error } = await supabase
      .from('flashcards')
      .update(updateData)
      .eq('id', cardId);

    if (error) {
      console.error('Supabase error updating card:', error);
      throw error;
    }
    
    console.log('Card updated successfully');
  },

  async deleteCard(cardId: string): Promise<void> {
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', cardId);

    if (error) throw error;
  }
};
