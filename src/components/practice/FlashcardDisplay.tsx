
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flashcard } from '@/types/deck';
import { CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlashcardDisplayProps {
  card: Flashcard;
  onAnswer: (isCorrect: boolean) => void;
  mode: 'practice' | 'test';
}

const FlashcardDisplay: React.FC<FlashcardDisplayProps> = ({ card, onAnswer, mode }) => {
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
  useEffect(() => {
    // Prioritized answer selection
    const generateOptions = () => {
      // Start with the correct answer and manual incorrect answers
      const baseAnswers = [
        card.correct_answer,
        ...card.manual_incorrect_answers
      ];
      
      // Add other incorrect answers from the pool
      const remainingAnswers = card.incorrect_answers.filter(
        answer => !baseAnswers.includes(answer)
      );
      
      // Shuffle remaining answers
      for (let i = remainingAnswers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remainingAnswers[i], remainingAnswers[j]] = [remainingAnswers[j], remainingAnswers[i]];
      }
      
      // Combine all answers and ensure we have exactly 4 options
      const allAnswers = [...baseAnswers, ...remainingAnswers];
      const finalAnswers = allAnswers.slice(0, 4);
      
      // Shuffle the final array to randomize position
      for (let i = finalAnswers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [finalAnswers[i], finalAnswers[j]] = [finalAnswers[j], finalAnswers[i]];
      }
      
      setOptions(finalAnswers);
    };
    
    generateOptions();
    setSelectedAnswer(null);
    setShowFeedback(false);
  }, [card]);
  
  const handleOptionClick = (option: string) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections
    
    setSelectedAnswer(option);
    const isCorrect = option === card.correct_answer;
    
    setShowFeedback(true);
    
    // In practice mode, show feedback for longer
    const feedbackDelay = mode === 'practice' ? (isCorrect ? 1000 : 2000) : 1000;
    
    setTimeout(() => {
      setShowFeedback(false);
      onAnswer(isCorrect);
    }, feedbackDelay);
  };
  
  const isOptionSelected = (option: string) => selectedAnswer === option;
  const isOptionCorrect = (option: string) => option === card.correct_answer;
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={card.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-lg mx-auto"
      >
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-medium">{card.front_text}</h3>
              </div>
              
              <div className="space-y-3">
                {options.map((option, index) => (
                  <Button
                    key={index}
                    variant={isOptionSelected(option) ? (isOptionCorrect(option) ? "default" : "destructive") : "outline"}
                    className={`w-full justify-start text-left p-4 h-auto ${
                      showFeedback && isOptionCorrect(option) ? "bg-green-100 text-green-800 hover:bg-green-200" : ""
                    } ${
                      showFeedback && selectedAnswer === option && !isOptionCorrect(option) ? "bg-red-100 text-red-800 hover:bg-red-200" : ""
                    }`}
                    onClick={() => handleOptionClick(option)}
                    disabled={selectedAnswer !== null}
                  >
                    <div className="flex items-center w-full">
                      <span className="flex-1">{option}</span>
                      {showFeedback && isOptionCorrect(option) && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {showFeedback && selectedAnswer === option && !isOptionCorrect(option) && (
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
