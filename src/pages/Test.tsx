
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeck } from '@/context/DeckContext';
import Layout from '@/components/layout/Layout';
import FlashcardDisplay from '@/components/practice/FlashcardDisplay';
import SummaryView from '@/components/practice/SummaryView';
import { Flashcard } from '@/types/deck';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft } from 'lucide-react';

const Test = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDeck } = useDeck();
  
  // States
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [incorrectCards, setIncorrectCards] = useState<Flashcard[]>([]);
  const [reviewCards, setReviewCards] = useState<Flashcard[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
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
    
    const deck = getDeck(id);
    if (!deck || deck.cards.length === 0) {
      navigate('/dashboard');
      return;
    }
    
    // Shuffle cards
    const shuffledCards = [...deck.cards];
    for (let i = shuffledCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
    }
    
    setCards(shuffledCards);
    setCurrentCardIndex(0);
    setIncorrectCards([]);
    setReviewCards([]);
    setIsReviewMode(false);
    setShowSummary(false);
    setStats({
      initialCorrect: 0,
      overallCorrect: 0,
      totalAttempts: 0,
    });
  }, [id, getDeck, navigate]);
  
  if (!id || cards.length === 0) return null;
  
  const deck = getDeck(id);
  if (!deck) return null;
  
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
    
    // In test mode, we track incorrect cards differently than in practice mode
    if (!isCorrect) {
      if (isReviewMode) {
        // In review mode, if they get it wrong again, keep it in the review cards
        setReviewCards(prev => [...prev.filter(c => c.id !== currentCard.id), currentCard]);
      } else {
        // In initial mode, add to both incorrect and review lists
        setIncorrectCards(prev => [...prev, currentCard]);
        setReviewCards(prev => [...prev, currentCard]);
      }
    } else if (isReviewMode) {
      // In review mode, if they get it right, remove from review cards but keep in incorrect list
      // for the summary
    }
    
    // Move to next card
    if (currentCardIndex < currentCards.length - 1) {
      // More cards in current mode
      setCurrentCardIndex(prev => prev + 1);
    } else if (!isReviewMode && reviewCards.length > 0) {
      // Finished initial run, has review cards
      setIsReviewMode(true);
      setCurrentCardIndex(0);
    } else if (isReviewMode && reviewCards.filter(c => c.id !== currentCard.id).length > 0) {
      // Still have review cards to go through (excluding the one just answered)
      setReviewCards(prev => prev.filter(c => c.id !== currentCard.id));
      setCurrentCardIndex(0);
    } else {
      // Truly done
      setShowSummary(true);
    }
  };
  
  const handleStartReviewMode = () => {
    if (incorrectCards.length > 0) {
      setReviewCards([...incorrectCards]);
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
            incorrectCards={incorrectCards}
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
                    {isReviewMode ? 'Review Mode' : 'Test Mode'}
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
                key={`${currentCard.id}-${currentCardIndex}`}
                card={currentCard}
                onAnswer={handleAnswer}
                mode="test"
              />
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Test;
