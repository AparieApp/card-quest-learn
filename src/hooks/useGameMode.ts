import { useState, useEffect } from 'react';
import { Deck, Flashcard } from '@/types/deck';
import { useDeck } from '@/context/DeckContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface GameModeState {
  deck: Deck | null;
  cards: Flashcard[];
  currentCardIndex: number;
  incorrectCards: Flashcard[];
  reviewCards: Flashcard[];
  isReviewMode: boolean;
  showSummary: boolean;
  isLoading: boolean;
  stats: {
    initialCorrect: number;
    overallCorrect: number;
    totalAttempts: number;
  };
}

export const useGameMode = (deckId: string | undefined, mode: 'practice' | 'test') => {
  const navigate = useNavigate();
  const { getDeck, refreshDecks } = useDeck();
  const [state, setState] = useState<GameModeState>({
    deck: null,
    cards: [],
    currentCardIndex: 0,
    incorrectCards: [],
    reviewCards: [],
    isReviewMode: false,
    showSummary: false,
    isLoading: true,
    stats: {
      initialCorrect: 0,
      overallCorrect: 0,
      totalAttempts: 0,
    },
  });

  useEffect(() => {
    if (!deckId) {
      navigate('/dashboard');
      return;
    }
    
    const loadDeck = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      try {
        await refreshDecks();
        const fetchedDeck = getDeck(deckId);
        if (!fetchedDeck || fetchedDeck.cards.length === 0) {
          toast.error('Deck not found or has no cards');
          navigate('/dashboard');
          return;
        }
        
        const shuffledCards = [...fetchedDeck.cards].sort(() => Math.random() - 0.5);
        
        setState(prev => ({
          ...prev,
          deck: fetchedDeck,
          cards: shuffledCards,
          isLoading: false,
        }));
      } catch (error) {
        console.error('Error loading deck:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    loadDeck();
  }, [deckId, getDeck, navigate, refreshDecks]);

  const handleAnswer = (isCorrect: boolean) => {
    setState(prev => {
      const currentCard = prev.cards[prev.currentCardIndex];
      const newStats = {
        initialCorrect: prev.isReviewMode ? 
          prev.stats.initialCorrect : 
          prev.stats.initialCorrect + (isCorrect ? 1 : 0),
        overallCorrect: prev.stats.overallCorrect + (isCorrect ? 1 : 0),
        totalAttempts: prev.stats.totalAttempts + 1,
      };

      let newIncorrectCards = [...prev.incorrectCards];
      let newReviewCards = [...prev.reviewCards];

      if (!isCorrect) {
        if (prev.isReviewMode) {
          // In review mode, if they get it wrong again, keep it in the review cards
          newReviewCards = [...newReviewCards.filter(c => c.id !== currentCard.id), currentCard];
        } else {
          // In initial mode, add to both incorrect and review lists
          newIncorrectCards = [...newIncorrectCards, currentCard];
          newReviewCards = [...newReviewCards, currentCard];
        }
      } else if (prev.isReviewMode) {
        // Remove correctly answered cards from review in review mode
        newReviewCards = newReviewCards.filter(c => c.id !== currentCard.id);
      }

      const isLastCard = prev.currentCardIndex >= prev.cards.length - 1;
      const hasCardsToReview = mode === 'test' ? 
        newReviewCards.length > 0 : 
        !prev.isReviewMode && newReviewCards.length > 0;

      return {
        ...prev,
        stats: newStats,
        incorrectCards: newIncorrectCards,
        reviewCards: newReviewCards,
        currentCardIndex: isLastCard ? 0 : prev.currentCardIndex + 1,
        isReviewMode: isLastCard ? hasCardsToReview : prev.isReviewMode,
        showSummary: isLastCard && (!hasCardsToReview || prev.isReviewMode),
      };
    });
  };

  const startReviewMode = () => {
    if (state.incorrectCards.length > 0) {
      setState(prev => ({
        ...prev,
        reviewCards: [...prev.incorrectCards],
        isReviewMode: true,
        currentCardIndex: 0,
        showSummary: false,
      }));
    }
  };

  return {
    ...state,
    handleAnswer,
    startReviewMode,
  };
};
