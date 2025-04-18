import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeck } from '@/context/DeckContext';
import Layout from '@/components/layout/Layout';
import FlashcardDisplay from '@/components/practice/FlashcardDisplay';
import SummaryView from '@/components/practice/SummaryView';
import { Flashcard, Deck } from '@/types/deck';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Practice = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDeck, refreshDecks } = useDeck();
  
  // States
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [reviewCards, setReviewCards] = useState<Flashcard[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    initialCorrect: 0,
    overallCorrect: 0,
    totalAttempts: 0,
  });
  
  // Load and shuffle deck cards
  useEffect(() => {
    if (!id) {
      navigate('/dashboard');
      return;
    }
    
    const loadDeck = async () => {
      setIsLoading(true);
      try {
        await refreshDecks();
        const fetchedDeck = getDeck(id);
        if (!fetchedDeck || fetchedDeck.cards.length === 0) {
          toast.error('Deck not found or has no cards');
          navigate('/dashboard');
          return;
        }
        
        setDeck(fetchedDeck);
        
        // Shuffle cards
        const shuffledCards = [...fetchedDeck.cards];
        for (let i = shuffledCards.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
        }
        
        setCards(shuffledCards);
        setCurrentCardIndex(0);
        setReviewCards([]);
        setIsReviewMode(false);
        setShowSummary(false);
        setStats({
          initialCorrect: 0,
          overallCorrect: 0,
          totalAttempts: 0,
        });
      } catch (error) {
        console.error('Error loading deck:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDeck();
  }, [id, getDeck, navigate, refreshDecks]);
  
  if (!id || isLoading) {
    return (
      <Layout>
        <div className="container py-12 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-flashcard-primary" />
          <p className="mt-4 text-muted-foreground">Loading cards...</p>
        </div>
      </Layout>
    );
  }
  
  if (!deck || cards.length === 0) return null;
  
  const currentCards = isReviewMode ? reviewCards : cards;
  const currentCard = currentCards[currentCardIndex];
  const progress = Math.round(((currentCardIndex + 1) / currentCards.length) * 100);
  
  const handleAnswer = (isCorrect: boolean) => {
    // Update stats
    setStats(prev => ({
      initialCorrect: isReviewMode ? prev.initialCorrect : prev.initialCorrect + (isCorrect ? 1 : 0),
      overallCorrect: prev.overallCorrect + (isCorrect ? 1 : 0),
      totalAttempts: prev.totalAttempts + 1,
    }));
    
    // If incorrect and not already in review cards, add to review
    if (!isCorrect && !isReviewMode) {
      setReviewCards(prev => [...prev, currentCard]);
    }
    
    // Move to next card
    if (currentCardIndex < currentCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      // Finished all cards
      if (isReviewMode || reviewCards.length === 0) {
        // If in review mode or no cards to review, show summary
        setShowSummary(true);
      } else {
        // Otherwise, switch to review mode
        setIsReviewMode(true);
        setCurrentCardIndex(0);
      }
    }
  };
  
  const handleStartReviewMode = () => {
    if (reviewCards.length > 0) {
      setIsReviewMode(true);
      setCurrentCardIndex(0);
      setShowSummary(false);
    }
  };
  
  const handleBackClick = () => {
    if (confirm('Are you sure you want to leave? Your progress will be lost.')) {
      navigate(`/deck/${id}`);
    }
  };

  return (
    <Layout>
      <div className="container py-6">
        {showSummary ? (
          <SummaryView
            deckId={id}
            initialCorrect={stats.initialCorrect}
            totalCards={cards.length}
            overallCorrect={stats.overallCorrect}
            overallAttempts={stats.totalAttempts}
            incorrectCards={reviewCards}
            onReviewMode={handleStartReviewMode}
          />
        ) : (
          <div className="flex flex-col items-center max-w-3xl mx-auto">
            <div className="w-full mb-8">
              <div className="flex justify-between items-center mb-4">
                <Button variant="ghost" size="sm" onClick={handleBackClick}>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back to Deck
                </Button>
                <div className="text-right">
                  <h2 className="font-semibold text-xl">{deck.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {isReviewMode ? 'Review Mode' : 'Practice Mode'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Card {currentCardIndex + 1} of {currentCards.length}</span>
                  <span>{progress}% complete</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
            
            {currentCard && (
              <FlashcardDisplay
                key={currentCardIndex}
                card={currentCard}
                onAnswer={handleAnswer}
                mode="practice"
              />
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Practice;
