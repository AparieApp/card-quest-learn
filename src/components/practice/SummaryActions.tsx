
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Home,
  RotateCcw,
  Repeat,
  Play,
  Heart,
  Star,
} from "lucide-react";
import { useDeck } from "@/context/DeckContext";
import { useAuth } from "@/context/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SummaryActionsProps {
  deckId: string;
  incorrectCardsLength: number;
  isTestMode: boolean;
  isReviewMode: boolean;
  onReviewMode: () => void;
  onContinuePractice?: () => void;
  onRestartPractice?: () => void;
  shareCode?: string;
}

const SummaryActions: React.FC<SummaryActionsProps> = ({
  deckId,
  incorrectCardsLength,
  isTestMode,
  isReviewMode,
  onReviewMode,
  onContinuePractice,
  onRestartPractice,
  shareCode,
}) => {
  const { toggleFavorite, isFavorite, copyDeck } = useDeck();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isSharedDeck = !!shareCode || window.location.pathname.includes("/shared/");

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("You need to log in to favorite decks", {
        action: {
          label: "Login",
          onClick: () => navigate("/auth"),
        },
      });
      return;
    }
    await toggleFavorite(deckId);
  };

  const handleReturnHome = () => {
    if (isSharedDeck && shareCode) {
      navigate(`/shared/${shareCode}`);
    } else {
      navigate("/dashboard");
    }
  };

  const handleAddToDeck = async () => {
    if (!isAuthenticated) {
      toast.error("You need to log in to save this deck to your collection", {
        action: {
          label: "Login",
          onClick: () => navigate("/auth"),
        },
      });
      return;
    }
    try {
      const copiedDeck = await copyDeck(deckId);
      toast.success("Deck saved to your collection!");
      navigate(`/deck/${copiedDeck.id}`);
    } catch (error) {
      console.error("Error copying deck:", error);
      toast.error("Failed to save deck to your collection");
    }
  };

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <Button variant="outline" onClick={handleReturnHome}>
        <Home className="mr-2 h-4 w-4" /> 
        {isSharedDeck ? "Return to Deck" : "Return Home"}
      </Button>

      {isTestMode && incorrectCardsLength > 0 && (
        <Button
          variant="default"
          onClick={onReviewMode}
          className="bg-flashcard-primary hover:bg-flashcard-secondary"
        >
          <RotateCcw className="mr-2 h-4 w-4" /> Review Incorrect
        </Button>
      )}

      {!isTestMode && !isReviewMode && incorrectCardsLength > 0 && (
        <Button
          variant="default"
          onClick={onReviewMode}
          className="bg-flashcard-primary hover:bg-flashcard-secondary"
        >
          <RotateCcw className="mr-2 h-4 w-4" /> Review Incorrect
        </Button>
      )}

      {!isTestMode && isReviewMode && onContinuePractice && (
        <Button
          variant="default"
          onClick={onContinuePractice}
          className="bg-flashcard-primary hover:bg-flashcard-secondary"
        >
          <Repeat className="mr-2 h-4 w-4" /> Continue Review
        </Button>
      )}

      {!isTestMode && !isReviewMode && onContinuePractice && (
        <Button
          variant="default"
          onClick={onContinuePractice}
          className="bg-flashcard-primary hover:bg-flashcard-secondary"
        >
          <Repeat className="mr-2 h-4 w-4" /> Continue Practice
        </Button>
      )}

      {onRestartPractice && (
        <Button variant="default" onClick={onRestartPractice}>
          <Play className="mr-2 h-4 w-4" />
          {isTestMode ? "Test Again" : "Practice Again"}
        </Button>
      )}

      <Button
        variant={isFavorite(deckId) ? "outline" : "default"}
        className={isFavorite(deckId) ? "border-red-400" : "bg-red-500 hover:bg-red-600"}
        onClick={handleToggleFavorite}
      >
        <Heart
          className={`mr-2 h-4 w-4 ${isFavorite(deckId) ? "fill-red-500 text-red-500" : "text-white"}`}
        />
        {isFavorite(deckId) ? "Favorited" : "Add to Favorites"}
      </Button>

      {isSharedDeck && (
        <Button
          variant="default"
          onClick={handleAddToDeck}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Star className="mr-2 h-4 w-4" />
          Add to My Decks
        </Button>
      )}
    </div>
  );
};

export default SummaryActions;
