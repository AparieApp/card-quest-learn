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
        question_type: cardData.question_type,
        correct_answer: cardData.question_type === 'single-choice' ? cardData.correct_answer : undefined,
        correct_answers: cardData.question_type === 'multiple-select' ? cardData.correct_answers : undefined,
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
    return CardMapper.toDomain(data as any);
  },

  async updateCard(deckId: string, cardId: string, cardData: UpdateCardInput): Promise<void> {
    console.log('Updating card with data:', cardData);
    console.log('Manual incorrect answers to update:', cardData.manual_incorrect_answers);
    
    const updatePayload: { [key: string]: any } = {
      front_text: cardData.front_text,
      question_image_url: cardData.question_image_url,
      question_type: cardData.question_type,
      ...(cardData.incorrect_answers !== undefined && { incorrect_answers: cardData.incorrect_answers || [] }),
      ...(cardData.manual_incorrect_answers !== undefined && { manual_incorrect_answers: cardData.manual_incorrect_answers || [] }),
    };

    if (cardData.question_type === 'single-choice') {
      updatePayload.correct_answer = cardData.correct_answer;
      updatePayload.correct_answers = null;
    } else if (cardData.question_type === 'multiple-select') {
      updatePayload.correct_answers = cardData.correct_answers;
      updatePayload.correct_answer = null;
    } else {
      if (cardData.correct_answer !== undefined) {
        updatePayload.correct_answer = cardData.correct_answer;
      }
      if (cardData.correct_answers !== undefined) {
        updatePayload.correct_answers = cardData.correct_answers;
      }
    }
    
    Object.keys(updatePayload).forEach(key => {
      if (updatePayload[key] === undefined) {
        delete updatePayload[key];
      }
    });

    const { error } = await supabase
      .from('flashcards')
      .update(updatePayload)
      .eq('id', cardId)
      .eq('deck_id', deckId);

    if (error) {
      console.error('Supabase error updating card:', error);
      throw error;
    }
    
    console.log('Successfully updated card:', cardId);
  },

  async deleteCard(deckId: string, cardId: string): Promise<void> {
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', cardId)
      .eq('deck_id', deckId);

    if (error) throw error;
  }
};
