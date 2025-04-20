
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
  currentCycle?: Flashcard[];
  onAnswer: (isCorrect: boolean) => void;
  mode: 'practice' | 'test';
}

const FlashcardDisplay: React.FC<FlashcardDisplayProps> = ({ 
  card, 
  deck, 
  currentCycle = [], 
  onAnswer, 
  mode 
}) => {
  const [options, setOptions] = useState<AnswerOption[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
  useEffect(() => {
    const answerOptions = generateAnswerOptions(card, deck, currentCycle);
    setOptions(answerOptions);
    setSelectedAnswer(null);
    setShowFeedback(false);
  }, [card, deck, currentCycle]);
  
  const handleOptionClick = (option: AnswerOption) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(option.text);
    setShowFeedback(true);
    
    const feedbackDelay = mode === 'practice' ? (option.isCorrect ? 1000 : 2000) : 1000;
    
    setTimeout(() => {
      setShowFeedback(false);
      onAnswer(option.isCorrect);
    }, feedbackDelay);
  };
  
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
                    variant={selectedAnswer === option.text ? (option.isCorrect ? "default" : "destructive") : "outline"}
                    className={`w-full justify-start text-left p-4 h-auto ${
                      showFeedback && option.isCorrect ? "bg-green-100 text-green-800 hover:bg-green-200" : ""
                    } ${
                      showFeedback && selectedAnswer === option.text && !option.isCorrect ? "bg-red-100 text-red-800 hover:bg-red-200" : ""
                    }`}
                    onClick={() => handleOptionClick(option)}
                    disabled={selectedAnswer !== null}
                  >
                    <div className="flex items-center w-full">
                      <span className="flex-1">{option.text}</span>
                      {showFeedback && option.isCorrect && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {showFeedback && selectedAnswer === option.text && !option.isCorrect && (
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
