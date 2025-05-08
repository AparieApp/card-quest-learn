
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flashcard, Deck } from '@/types/deck';
import { CheckCircle, XCircle, CheckSquare, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAnswerOptions, AnswerOption } from '@/services/answerGenerationService';

interface FlashcardDisplayProps {
  card: Flashcard;
  deck: Deck;
  cards: Flashcard[];
  previousCycles?: Flashcard[];
  onAnswer: (isCorrect: boolean) => void;
  mode: 'practice' | 'test';
  showRemovePrompt?: boolean;
  onRemoveCardPrompt?: (shouldRemove: boolean) => void;
  currentStreak?: number;
  streakThreshold?: number;
}

const FlashcardDisplay: React.FC<FlashcardDisplayProps> = ({
  card,
  deck,
  cards = [],
  previousCycles = [],
  onAnswer,
  mode,
  showRemovePrompt = false,
  onRemoveCardPrompt,
  currentStreak = 0,
  streakThreshold = 3,
}) => {
  const [options, setOptions] = useState<AnswerOption[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [animateExit, setAnimateExit] = useState<'correct' | 'incorrect' | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  const isMultipleSelect = useMemo(() => card.question_type === 'multiple-select', [card.question_type]);

  useEffect(() => {
    const answerOptions = generateAnswerOptions(card, deck, cards, previousCycles);
    setOptions(answerOptions);
    setSelectedAnswers([]);
    setShowFeedback(false);
    setAnimateExit(null);
    setIsAnswerSubmitted(false);
  }, [card, deck, cards, previousCycles]);

  const handleOptionClick = (optionText: string) => {
    if (isAnswerSubmitted || showRemovePrompt) return;

    if (isMultipleSelect) {
      setSelectedAnswers(prev =>
        prev.includes(optionText)
          ? prev.filter(item => item !== optionText)
          : [...prev, optionText]
      );
    } else {
      setSelectedAnswers([optionText]);
      setIsAnswerSubmitted(true);
      const selectedOption = options.find(opt => opt.text === optionText);
      if (selectedOption) {
        setShowFeedback(true);
        setAnimateExit(selectedOption.isCorrect ? 'correct' : 'incorrect');
        const feedbackDelay = mode === 'practice' 
          ? (selectedOption.isCorrect ? 550 : 700)
          : 550;
        setTimeout(() => {
          setShowFeedback(false);
          onAnswer(selectedOption.isCorrect);
        }, feedbackDelay);
      }
    }
  };

  const handleSubmitMultipleSelect = () => {
    if (!isMultipleSelect || selectedAnswers.length === 0 || isAnswerSubmitted || showRemovePrompt) return;

    setIsAnswerSubmitted(true);
    const correctAnswersForCard = card.correct_answers || [];
    const isCorrect = 
      selectedAnswers.length === correctAnswersForCard.length &&
      selectedAnswers.every(sa => correctAnswersForCard.includes(sa)) &&
      correctAnswersForCard.every(ca => selectedAnswers.includes(ca));

    setShowFeedback(true);
    setAnimateExit(isCorrect ? 'correct' : 'incorrect');
    const feedbackDelay = mode === 'practice' 
      ? (isCorrect ? 550 : 700)
      : 550;
    setTimeout(() => {
      setShowFeedback(false);
      onAnswer(isCorrect);
    }, feedbackDelay);
  };

  if (showRemovePrompt) {
    return (
      <motion.div
        key={`${card.id}-prompt`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg mx-auto"
      >
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-medium">Great progress!</h3>
                <p className="text-muted-foreground mt-2">
                  You've gotten this card correct multiple times in a row. Remove it from practice?
                </p>
              </div>
              <div className="flex justify-center items-center gap-4">
                <Button variant="default" onClick={() => onRemoveCardPrompt?.(true)} className="w-32">Yes, remove</Button>
                <Button variant="outline" onClick={() => onRemoveCardPrompt?.(false)} className="w-32">No, continue</Button>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <p className="font-medium text-sm mb-1">Card:</p>
                <p>{card.front_text}</p>
                <p className="font-medium text-sm mt-3 mb-1">Correct answer(s):</p>
                {isMultipleSelect ? 
                  (card.correct_answers || []).map((ans, i) => <p key={i} className="text-green-600">{ans}</p>) :
                  <p className="text-green-600">{card.correct_answer}</p>
                }
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
    exitCorrect: { x: '110%', opacity: 0, transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] } },
    exitIncorrect: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={card.id}
        initial="initial"
        animate="animate"
        exit={animateExit === 'correct' ? 'exitCorrect' : 'exitIncorrect'}
        variants={cardVariants}
        className={`w-full max-w-lg mx-auto ${showFeedback && animateExit === 'correct' ? 'animate-flash-correct' : ''}`}
      >
        <Card className="shadow-lg border-2 border-muted">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="text-center">
                {card.question_image_url ? (
                  <img 
                    src={card.question_image_url} 
                    alt="Question" 
                    className="mx-auto mb-4 max-w-full max-h-60 object-contain rounded-md shadow-sm" 
                  />
                ) : null}
                <h3 className="text-xl font-medium">{card.front_text}</h3>
                <div className="mt-2 flex items-center justify-center">
                  <span className={`px-3 py-1 text-xs rounded-full ${isMultipleSelect ? 
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' : 
                    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'}`}>
                    {isMultipleSelect ? 'Select all that apply' : 'Select one answer'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {options.map((option, index) => {
                  const isSelected = selectedAnswers.includes(option.text);
                  
                  return (
                    <Button
                      key={index}
                      variant={
                        isAnswerSubmitted ? 
                          (option.isCorrect ? "default" : (isSelected ? "destructive" : "outline")) :
                          (isSelected ? "secondary" : "outline")
                      }
                      className={`w-full justify-start text-left p-4 h-auto transition-all duration-150 ${
                        isMultipleSelect ? "pl-3" : ""
                      } ${
                        showFeedback && option.isCorrect
                          ? "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 border-green-300 dark:border-green-600"
                          : ""
                      } ${
                        showFeedback && isSelected && !option.isCorrect
                          ? "bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 border-red-300 dark:border-red-600"
                          : ""
                      }`}
                      onClick={() => handleOptionClick(option.text)}
                      disabled={isAnswerSubmitted && !isMultipleSelect}
                    >
                      <div className="flex items-center w-full">
                        {isMultipleSelect && (
                          <div className="mr-2 flex-shrink-0">
                            {isSelected ? 
                              <div className="h-5 w-5 rounded border-2 border-blue-500 bg-blue-500 flex items-center justify-center">
                                <CheckSquare className="h-4 w-4 text-white" />
                              </div> : 
                              <div className="h-5 w-5 rounded border-2 border-gray-300 dark:border-gray-600">
                                <Square className="h-4 w-4 text-transparent" />
                              </div>
                            }
                          </div>
                        )}
                        <span className="flex-1">{option.text}</span>
                        {showFeedback && option.isCorrect && (
                          <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                        )}
                        {showFeedback && isSelected && !option.isCorrect && (
                          <XCircle className="h-5 w-5 text-red-500 ml-2" />
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
              {isMultipleSelect && !isAnswerSubmitted && (
                <Button 
                  onClick={handleSubmitMultipleSelect} 
                  className={`w-full mt-4 ${
                    selectedAnswers.length > 0 
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-300 text-gray-700 hover:bg-gray-300 cursor-not-allowed"
                  }`}
                  disabled={selectedAnswers.length === 0 || isAnswerSubmitted}
                >
                  Submit Answer{selectedAnswers.length > 0 ? ` (${selectedAnswers.length})` : ''}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default FlashcardDisplay;
