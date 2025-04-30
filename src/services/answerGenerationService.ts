
import { Deck, Flashcard } from '@/types/deck';

export interface AnswerOption {
  text: string;
  isCorrect: boolean;
}

// Create a cache for generated answers to prevent excessive regeneration
const answerCache = new Map<string, AnswerOption[]>();
const MAX_CACHE_SIZE = 100;
const MAX_ANSWER_GENERATION_ATTEMPTS = 10;

export const generateAnswerOptions = (
  currentCard: Flashcard,
  deck: Deck,
  currentCycle: Flashcard[] = [],
  previousCycles: Flashcard[] = []
): AnswerOption[] => {
  if (!currentCard || !deck) {
    console.error('Invalid card or deck provided to answer generator');
    return [
      { text: 'Invalid card', isCorrect: true },
      { text: 'Option 2', isCorrect: false },
      { text: 'Option 3', isCorrect: false },
      { text: 'Option 4', isCorrect: false },
    ];
  }
  
  // Generate a cache key based on card ID and deck ID
  const cacheKey = `${currentCard.id}-${deck.id}`;
  
  // Check if we have this answer set in cache
  if (answerCache.has(cacheKey)) {
    console.log('Using cached answer options for card:', currentCard.id);
    return answerCache.get(cacheKey) || [];
  }
  
  console.log('Generating answer options for card:', currentCard.id);
  
  // Start with the correct answer
  const options: AnswerOption[] = [
    { text: currentCard.correct_answer, isCorrect: true }
  ];
  
  // Add manual incorrect answers first (if any)
  const manualIncorrect = currentCard.manual_incorrect_answers || [];
  console.log('Manual incorrect answers:', manualIncorrect.length);
  
  manualIncorrect.forEach(answer => {
    if (!options.some(opt => opt.text === answer) && answer.trim()) {
      options.push({ text: answer, isCorrect: false });
    }
  });
  
  // If we still need more options, add from incorrect_answers array
  const remainingIncorrect = currentCard.incorrect_answers || [];
  console.log('Remaining incorrect answers:', remainingIncorrect.length);
  
  for (const answer of remainingIncorrect) {
    if (options.length >= 4) break;
    if (!options.some(opt => opt.text === answer) && answer.trim()) {
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
      if (!options.some(opt => opt.text === answer) && answer.trim()) {
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
      if (!options.some(opt => opt.text === answer) && answer.trim()) {
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
      if (!options.some(opt => opt.text === answer) && answer.trim()) {
        options.push({ text: answer, isCorrect: false });
      }
    }
  }
  
  // If we still don't have 4 options, create synthetic options
  let attempts = 0;
  while (options.length < 4 && attempts < MAX_ANSWER_GENERATION_ATTEMPTS) {
    attempts++;
    
    if (attempts >= MAX_ANSWER_GENERATION_ATTEMPTS) {
      console.warn('Reached maximum attempts to generate answers, using fallback options');
      
      // Add fallback options
      const fallbackOptions = [
        "Other answer",
        "Alternative option",
        "Different answer",
        "Another choice"
      ];
      
      for (const fallback of fallbackOptions) {
        if (options.length >= 4) break;
        if (!options.some(opt => opt.text === fallback)) {
          options.push({ text: fallback, isCorrect: false });
        }
      }
      
      break;
    }
    
    const correctAnswer = currentCard.correct_answer;
    if (options.length === 1 && correctAnswer) {
      // Create simple variations of the correct answer
      const variation1 = `Not ${correctAnswer}`;
      const variation2 = `Almost ${correctAnswer}`;
      const variation3 = `Similar to ${correctAnswer}`;
      
      if (!options.some(opt => opt.text === variation1)) {
        options.push({ text: variation1, isCorrect: false });
      }
      
      if (options.length < 4 && !options.some(opt => opt.text === variation2)) {
        options.push({ text: variation2, isCorrect: false });
      }
      
      if (options.length < 4 && !options.some(opt => opt.text === variation3)) {
        options.push({ text: variation3, isCorrect: false });
      }
    } else {
      console.warn('Not enough unique answers available, using synthetic options');
      
      // Add a modified version of an existing option
      const baseOption = options.find(opt => opt.isCorrect)?.text || 'Option';
      const synthetic = `${baseOption} (alternative)`;
      
      if (!options.some(opt => opt.text === synthetic)) {
        options.push({ text: synthetic, isCorrect: false });
      }
    }
  }
  
  // Ensure we always have exactly 4 options
  while (options.length > 4) {
    // Remove a random incorrect option
    const incorrectIndices = options
      .map((opt, idx) => ({ isCorrect: opt.isCorrect, idx }))
      .filter(item => !item.isCorrect)
      .map(item => item.idx);
    
    if (incorrectIndices.length > 0) {
      const randomIndex = Math.floor(Math.random() * incorrectIndices.length);
      const indexToRemove = incorrectIndices[randomIndex];
      options.splice(indexToRemove, 1);
    } else {
      // Shouldn't happen, but just in case
      options.pop();
    }
  }
  
  // Shuffle the options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  
  console.log('Final options generated:', options.length);
  
  // Cache the result to prevent regeneration
  if (answerCache.size >= MAX_CACHE_SIZE) {
    // Remove oldest entry if cache is full (first item in the map)
    const firstKey = answerCache.keys().next().value;
    if (firstKey) {
      answerCache.delete(firstKey);
    }
  }
  
  answerCache.set(cacheKey, options);
  
  return options;
};

// Utility function to clear the answer cache
export const clearAnswerCache = (): void => {
  answerCache.clear();
  console.log('Answer cache cleared');
};
