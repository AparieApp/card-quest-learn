
import React from 'react';
import { Button } from '@/components/ui/button';
import { useDeck } from '@/context/DeckContext';
import { useAuth } from '@/context/auth';
import { Flashcard } from '@/types/deck';
import {
  BarChart,
  CheckCircle,
  Heart,
  XCircle,
  RotateCcw,
  Home,
  Star,
  Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface SummaryViewProps {
  deckId: string;
  initialCorrect: number;
  totalCards: number;
  overallCorrect: number;
  overallAttempts: number;
  incorrectCards: Flashcard[];
  isTestMode: boolean;
  onReviewMode: () => void;
}

const SummaryView: React.FC<SummaryViewProps> = ({
  deckId,
  initialCorrect,
  totalCards,
  overallCorrect,
  overallAttempts,
  incorrectCards,
  isTestMode,
  onReviewMode,
}) => {
  const { toggleFavorite, isFavorite } = useDeck();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const initialAccuracy = Math.round((initialCorrect / totalCards) * 100);
  const overallAccuracy = Math.round((overallCorrect / overallAttempts) * 100);
  
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('You need to log in to favorite decks');
      navigate('/auth');
      return;
    }
    
    await toggleFavorite(deckId);
  };
  
  const handleReturnHome = () => {
    navigate('/dashboard');
  };

  const handleStartAgain = () => {
    navigate(isTestMode ? `/deck/${deckId}/test` : `/deck/${deckId}/practice`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Summary</h1>
        <p className="text-muted-foreground">
          Your {isTestMode ? 'test' : 'practice'} results
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-md flex flex-col items-center justify-center">
          <div className="text-flashcard-primary mb-2">
            <BarChart className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold">Initial Accuracy</h2>
          <p className="text-4xl font-bold">{initialAccuracy}%</p>
          <p className="text-sm text-muted-foreground mt-2">
            {initialCorrect} of {totalCards} cards correct
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md flex flex-col items-center justify-center">
          <div className="text-flashcard-primary mb-2">
            <BarChart className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold">Overall Accuracy</h2>
          <p className="text-4xl font-bold">{overallAccuracy}%</p>
          <p className="text-sm text-muted-foreground mt-2">
            {overallCorrect} of {overallAttempts} answers correct
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          {incorrectCards.length > 0 
            ? `Review These Cards (${incorrectCards.length})`
            : 'Perfect Score! 🎉'}
        </h2>
        
        {incorrectCards.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {incorrectCards.map(card => (
              <div key={card.id} className="flex items-start p-3 border rounded-md">
                <XCircle className="h-5 w-5 text-red-500 shrink-0 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium">{card.front_text}</p>
                  <p className="text-sm text-green-600">
                    <span className="font-medium">Correct answer:</span> {card.correct_answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center py-8">
            <div className="flex flex-col items-center">
              <Star className="h-12 w-12 text-yellow-400 mb-2" />
              <p className="text-lg">You answered all cards correctly!</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-3 justify-center">
        <Button variant="outline" onClick={handleReturnHome}>
          <Home className="mr-2 h-4 w-4" /> Return Home
        </Button>
        
        {incorrectCards.length > 0 && (
          <Button variant="default" onClick={onReviewMode} className="bg-flashcard-primary hover:bg-flashcard-secondary">
            <RotateCcw className="mr-2 h-4 w-4" /> Review Incorrect
          </Button>
        )}
        
        <Button 
          variant="default"
          onClick={handleStartAgain}
        >
          <Play className="mr-2 h-4 w-4" />
          {isTestMode ? 'Test Again' : 'Practice Again'}
        </Button>
        
        <Button 
          variant={isFavorite(deckId) ? "outline" : "default"}
          className={isFavorite(deckId) ? "border-red-400" : "bg-red-500 hover:bg-red-600"}
          onClick={handleToggleFavorite}
        >
          <Heart className={`mr-2 h-4 w-4 ${isFavorite(deckId) ? "fill-red-500 text-red-500" : "text-white"}`} />
          {isFavorite(deckId) ? 'Favorited' : 'Add to Favorites'}
        </Button>
      </div>
    </div>
  );
};

export default SummaryView;
