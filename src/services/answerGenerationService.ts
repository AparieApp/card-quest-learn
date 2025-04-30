
import { Deck, Flashcard } from '@/types/deck';

export interface AnswerOption {
  text: string;
  isCorrect: boolean;
}

export const generateAnswerOptions = (
  currentCard: Flashcard,
  deck: Deck,
  currentCycle: Flashcard[] = [],
  previousCycles: Flashcard[] = []
): AnswerOption[] => {
  console.log('Generating answer options for card:', currentCard.id);
  
  // Start with the correct answer
  const options: AnswerOption[] = [
    { text: currentCard.correct_answer, isCorrect: true }
  ];
  
  // Add manual incorrect answers first (if any)
  const manualIncorrect = currentCard.manual_incorrect_answers || [];
  console.log('Manual incorrect answers:', manualIncorrect.length);
  
  manualIncorrect.forEach(answer => {
    if (!options.some(opt => opt.text === answer)) {
      options.push({ text: answer, isCorrect: false });
    }
  });
  
  // If we still need more options, add from incorrect_answers array
  const remainingIncorrect = currentCard.incorrect_answers || [];
  console.log('Remaining incorrect answers:', remainingIncorrect.length);
  
  for (const answer of remainingIncorrect) {
    if (options.length >= 4) break;
    if (!options.some(opt => opt.text === answer)) {
      options.push({ text: answer, isCorrect: false });
    }
  }
  
  // If we still need more, add correct answers from current cycle
  if (options.length < 4) {
    console.log('Adding answers from current cycle');
    const cycleAnswers = currentCycle
      .filter(card => card.id !== currentCard.id)
      .map(card => card.correct_answer);
      
    for (const answer of cycleAnswers) {
      if (options.length >= 4) break;
      if (!options.some(opt => opt.text === answer)) {
        options.push({ text: answer, isCorrect: false });
      }
    }
  }
  
  // If we still need more, add answers from previous cycles
  if (options.length < 4 && previousCycles.length > 0) {
    console.log('Adding answers from previous cycles');
    const previousAnswers = previousCycles
      .filter(card => card.id !== currentCard.id)
      .map(card => card.correct_answer);
      
    for (const answer of previousAnswers) {
      if (options.length >= 4) break;
      if (!options.some(opt => opt.text === answer)) {
        options.push({ text: answer, isCorrect: false });
      }
    }
  }
  
  // If we still need more, add correct answers from the entire deck
  if (options.length < 4) {
    console.log('Adding answers from deck');
    const deckAnswers = deck.cards
      .filter(card => card.id !== currentCard.id)
      .map(card => card.correct_answer);
      
    for (const answer of deckAnswers) {
      if (options.length >= 4) break;
      if (!options.some(opt => opt.text === answer)) {
        options.push({ text: answer, isCorrect: false });
      }
    }
  }
  
  // If we still don't have 4 options (very rare case), duplicate some incorrect answers
  while (options.length < 4) {
    console.warn('Not enough unique answers available, duplicating options');
    const incorrectOption = options.find(opt => !opt.isCorrect);
    if (incorrectOption) {
      options.push({ ...incorrectOption });
    } else {
      // Fallback: create a modified version of the correct answer
      options.push({ 
        text: `${currentCard.correct_answer} (alt)`, 
        isCorrect: false 
      });
    }
  }
  
  // Shuffle the options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  
  console.log('Final options generated:', options.length);
  return options;
};
