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
  console.log('Generating answer options for card:', currentCard.id, 'Type:', currentCard.question_type);
  
  const options: AnswerOption[] = [];
  const allPossibleAnswersInDeck = deck.cards.map(c => c.correct_answer).filter(Boolean) as string[];
  // Also consider collecting all `correct_answers` from multiple-select cards in the deck if needed for broader incorrect option pool

  if (currentCard.question_type === 'multiple-select') {
    // Add all correct answers for this card
    (currentCard.correct_answers || []).forEach(answer => {
      if (answer.trim() !== '' && !options.some(opt => opt.text === answer)) {
        options.push({ text: answer, isCorrect: true });
      }
    });

    // Add manual incorrect answers
    (currentCard.manual_incorrect_answers || []).forEach(answer => {
      if (options.length < 5 && answer.trim() !== '' && !options.some(opt => opt.text === answer)) {
        options.push({ text: answer, isCorrect: false });
      }
    });

    // Add from the card's own incorrect_answers array
    (currentCard.incorrect_answers || []).forEach(answer => {
      if (options.length < 5 && answer.trim() !== '' && !options.some(opt => opt.text === answer)) {
        options.push({ text: answer, isCorrect: false });
      }
    });
    
    // If we still need more options (e.g., to ensure a minimum of 2, or up to 4-5 total if not many correct/manual incorrect)
    // This part aims to add plausible distractors if the card itself doesn't have enough.
    // The target number of options (e.g. 4 or 5) should be flexible based on how many correct answers there are.
    // For multi-select, all correct answers MUST be shown. If that's 3, you need at least 1 incorrect.
    // If that's 5, then 5 options are shown. The goal is typically ~4 choices total for MCQs.
    // Let's aim for a MINIMUM of (number of correct answers + 1) or 2, whichever is greater, up to a MAX of 5 for now.
    let numCorrect = (currentCard.correct_answers || []).length;
    let minOptions = Math.max(2, numCorrect + 1); 
    let targetOptions = Math.max(minOptions, Math.min(5, numCorrect + 2)); // Try to get a couple of distractors
    if (numCorrect >= 4) targetOptions = numCorrect; // If 4+ correct, just show them if no space for distractors.

    const otherAnswersPool = [ 
      ...allPossibleAnswersInDeck,
      ...(currentCycle.map(c => c.correct_answer).filter(Boolean) as string[]),
      ...(previousCycles.map(c => c.correct_answer).filter(Boolean) as string[])
    ].filter(answer => 
        answer.trim() !== '' && 
        !options.some(opt => opt.text === answer) && // Not already in options
        !(currentCard.correct_answers || []).includes(answer) // Not one of the correct answers for THIS card
    );
    const shuffledDistractors = [...new Set(otherAnswersPool)].sort(() => Math.random() - 0.5);

    for (const answer of shuffledDistractors) {
      if (options.length >= targetOptions) break;
      options.push({ text: answer, isCorrect: false });
    }
    // Ensure at least one incorrect option if there are correct options and options < 2
    if (numCorrect > 0 && options.length < 2 && options.every(o => o.isCorrect)) {
         options.push({ text: "Incorrect Option 1", isCorrect: false}); // Fallback distractor
    }


  } else { // single-choice (existing logic, adapted)
    if (currentCard.correct_answer && currentCard.correct_answer.trim() !== '') {
      options.push({ text: currentCard.correct_answer, isCorrect: true });
    }

    (currentCard.manual_incorrect_answers || []).forEach(answer => {
      if (options.length < 4 && answer.trim() !== '' && !options.some(opt => opt.text === answer)) {
        options.push({ text: answer, isCorrect: false });
      }
    });

    (currentCard.incorrect_answers || []).forEach(answer => {
      if (options.length < 4 && answer.trim() !== '' && !options.some(opt => opt.text === answer)) {
        options.push({ text: answer, isCorrect: false });
      }
    });

    // Fill up to 4 options using other cards' correct answers as distractors
    const otherCorrectAnswers = [
        ...allPossibleAnswersInDeck,
        ...(currentCycle.map(c => c.correct_answer).filter(Boolean) as string[]),
        ...(previousCycles.map(c => c.correct_answer).filter(Boolean) as string[])
    ].filter(answer => 
        answer.trim() !== '' && 
        !options.some(opt => opt.text === answer) && 
        answer !== currentCard.correct_answer
    );
    const shuffledOtherCorrect = [...new Set(otherCorrectAnswers)].sort(() => Math.random() - 0.5);

    for (const answer of shuffledOtherCorrect) {
      if (options.length >= 4) break;
      options.push({ text: answer, isCorrect: false });
    }
  }
  
  // If not enough options generated (e.g. less than 2 for single-choice, or not enough for multi-select based on its rules),
  // add generic distractors. This part needs to be robust.
  let minTotalOptions = currentCard.question_type === 'multiple-select' ? Math.max(2, (currentCard.correct_answers || []).length) : 2;
  if ((currentCard.correct_answers || []).length === 0 && currentCard.question_type === 'multiple-select') minTotalOptions = 2; // fallback for malformed card
  if (currentCard.question_type === 'single-choice' && (!currentCard.correct_answer || currentCard.correct_answer.trim() === '')) minTotalOptions = 0; // no options if no correct answer
  
  let fallbackCounter = 1;
  while (options.length < minTotalOptions && minTotalOptions > 0) {
    const distractorText = `Option ${fallbackCounter + options.length}`;
    if (!options.some(opt => opt.text === distractorText)) {
        options.push({ text: distractorText, isCorrect: false });
    }
    fallbackCounter++;
    if (fallbackCounter > 5) break; // Safety break
  }
  
  // Ensure for single-choice we have max 4, for multi-select it can be more flexible up to a point (e.g. 5-6 if many correct)
  const maxOptions = currentCard.question_type === 'multiple-select' ? Math.max((currentCard.correct_answers || []).length, 5) : 4;
  if (options.length > maxOptions) {
      // Prioritize correct answers if truncating for multi-select
      if (currentCard.question_type === 'multiple-select') {
          const correctToShow = options.filter(o => o.isCorrect);
          const incorrectToShow = options.filter(o => !o.isCorrect).slice(0, maxOptions - correctToShow.length);
          options.splice(0, options.length, ...correctToShow, ...incorrectToShow);
      } else {
          options.splice(maxOptions);
      }
  }

  // Shuffle the final options list
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  
  console.log('Final options generated:', options.map(o => ({text: o.text, correct: o.isCorrect})));
  return options;
};
