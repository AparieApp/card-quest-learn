
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flashcard, Deck } from '@/types/deck';
import { CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAnswerOptions, AnswerOption } from '@/services/answerGenerationService';

interface FlashcardDisplayProps {
  card: Flashcard;
  deck: Deck;
  cards: Flashcard[]; // The pool of cards to generate answer options from
  previousCycles?: Flashcard[];
  onAnswer: (isCorrect: boolean) => void;
  mode: 'practice' | 'test';
  showRemovePrompt?: boolean;
  onRemoveCardPrompt?: (shouldRemove: boolean) => void;
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
}) => {
  const [options, setOptions] = useState<AnswerOption[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [animateExit, setAnimateExit] = useState<'correct' | 'incorrect' | null>(null);

  useEffect(() => {
    const answerOptions = generateAnswerOptions(card, deck, cards, previousCycles);
    setOptions(answerOptions);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setAnimateExit(null);
  }, [card, deck, cards, previousCycles]);

  const handleOptionClick = (option: AnswerOption) => {
    if (selectedAnswer !== null || showRemovePrompt) return;

    setSelectedAnswer(option.text);
    setShowFeedback(true);
    setAnimateExit(option.isCorrect ? 'correct' : 'incorrect');

    // Faster feedback times
    const feedbackDelay = mode === 'practice' 
      ? (option.isCorrect ? 550 : 700) // Reduced from 1000/2000 to 550/700ms
      : 550; // Test mode is always faster

    setTimeout(() => {
      setShowFeedback(false);
      onAnswer(option.isCorrect);
    }, feedbackDelay);
  };

  if (showRemovePrompt) {
    return (
      <motion.div
        key={`${card.id}-prompt`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }} // Faster animation (200ms)
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
                <Button
                  variant="default"
                  onClick={() => onRemoveCardPrompt?.(true)}
                  className="w-32"
                >
                  Yes, remove
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onRemoveCardPrompt?.(false)}
                  className="w-32"
                >
                  No, continue
                </Button>
              </div>

              <div className="p-4 bg-muted rounded-md">
                <p className="font-medium text-sm mb-1">Card:</p>
                <p>{card.front_text}</p>
                <p className="font-medium text-sm mt-3 mb-1">Correct answer:</p>
                <p className="text-green-600">{card.correct_answer}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Animation variants for different states
  const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
    exitCorrect: { 
      x: '110%', 
      opacity: 0,
      transition: { 
        duration: 0.4,
        ease: [0.34, 1.56, 0.64, 1] // Custom easing for smoother slide
      } 
    },
    exitIncorrect: { 
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 } 
    }
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
        <Card className={`shadow-lg ${showFeedback && animateExit === 'incorrect' ? 'animate-shake' : ''}`}>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-medium">{card.front_text}</h3>
              </div>

              <div className="space-y-3">
                {options.map((option, index) => (
                  <Button
                    key={index}
                    variant={
                      selectedAnswer === option.text
                        ? option.isCorrect
                          ? "default"
                          : "destructive"
                        : "outline"
                    }
                    className={`w-full justify-start text-left p-4 h-auto transition-colors duration-150 ${
                      showFeedback && option.isCorrect
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : ""
                    } ${
                      showFeedback &&
                      selectedAnswer === option.text &&
                      !option.isCorrect
                        ? "bg-red-100 text-red-800 hover:bg-red-200"
                        : ""
                    }`}
                    onClick={() => handleOptionClick(option)}
                    disabled={selectedAnswer !== null}
                  >
                    <div className="flex items-center w-full">
                      <span className="flex-1">{option.text}</span>
                      {showFeedback && option.isCorrect && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {showFeedback &&
                        selectedAnswer === option.text &&
                        !option.isCorrect && (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default FlashcardDisplay;
