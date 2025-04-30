
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Home,
  RotateCcw,
  Repeat,
  Play,
  Heart,
  Star,
  Bell,
  BellOff,
} from "lucide-react";
import { useDeck } from "@/context/DeckContext";
import { useAuth } from "@/context/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const { toggleFavorite, isFavorite, copyDeck, followDeck, unfollowDeck, isFollowingDeck } = useDeck();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isSharedDeck = !!shareCode || window.location.pathname.includes("/shared/");
  const [isFollowing, setIsFollowing] = useState(isFollowingDeck(deckId));
  const [isUpdatingFollowStatus, setIsUpdatingFollowStatus] = useState(false);

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

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      toast.error("You need to log in to follow this deck", {
        action: {
          label: "Login",
          onClick: () => navigate("/auth"),
        },
      });
      return;
    }
    
    setIsUpdatingFollowStatus(true);
    try {
      if (isFollowing) {
        await unfollowDeck(deckId);
        toast.success("You have unfollowed this deck");
        setIsFollowing(false);
      } else {
        await followDeck(deckId);
        toast.success("You are now following this deck");
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
      toast.error("Failed to update follow status");
    } finally {
      setIsUpdatingFollowStatus(false);
    }
  };

  // Common button styling with different levels of importance
  const primaryButtonClass = "bg-flashcard-primary hover:bg-flashcard-primary/90 text-white font-medium text-base px-5 py-2.5";
  const secondaryButtonClass = "bg-flashcard-secondary hover:bg-flashcard-secondary/90 text-flashcard-dark font-medium";
  const tertiaryButtonClass = "bg-white border border-gray-300 hover:bg-gray-100 text-gray-700";

  return (
    <div className="flex flex-col gap-6">
      {/* Primary actions - highest importance */}
      {(isTestMode || !isReviewMode) && incorrectCardsLength > 0 && (
        <div className="flex justify-center">
          <Button
            onClick={onReviewMode}
            className={cn(primaryButtonClass, "px-6 py-3 text-lg shadow-md")}
          >
            <RotateCcw className="mr-2 h-5 w-5" /> Review Incorrect
          </Button>
        </div>
      )}

      {/* Secondary actions - medium importance */}
      <div className="flex flex-wrap justify-center gap-4">
        {!isTestMode && isReviewMode && onContinuePractice && (
          <Button
            onClick={onContinuePractice}
            className={cn(secondaryButtonClass)}
          >
            <Repeat className="mr-2 h-4 w-4" /> Continue Review
          </Button>
        )}

        {!isTestMode && !isReviewMode && onContinuePractice && (
          <Button
            onClick={onContinuePractice}
            className={cn(secondaryButtonClass)}
          >
            <Repeat className="mr-2 h-4 w-4" /> Continue Practice
          </Button>
        )}

        {onRestartPractice && (
          <Button 
            onClick={onRestartPractice}
            className={cn(secondaryButtonClass)}
          >
            <Play className="mr-2 h-4 w-4" />
            {isTestMode ? "Test Again" : "Practice Again"}
          </Button>
        )}
      </div>

      {/* Tertiary actions - lowest importance */}
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          variant={isFavorite(deckId) ? "outline" : "default"}
          className={cn(
            tertiaryButtonClass,
            isFavorite(deckId) && "border-red-400"
          )}
          onClick={handleToggleFavorite}
          size="sm"
        >
          <Heart
            className={`mr-2 h-4 w-4 ${isFavorite(deckId) ? "fill-red-500 text-red-500" : ""}`}
          />
          {isFavorite(deckId) ? "Favorited" : "Add to Favorites"}
        </Button>

        <Button 
          variant="outline" 
          onClick={handleReturnHome}
          className={cn(tertiaryButtonClass)}
          size="sm"
        >
          <Home className="mr-2 h-4 w-4" /> 
          {isSharedDeck ? "Return to Deck" : "Return Home"}
        </Button>

        {isSharedDeck && (
          <>
            <Button
              variant="default"
              onClick={handleAddToDeck}
              className={cn(tertiaryButtonClass, "bg-blue-50 border-blue-200 hover:bg-blue-100")}
              size="sm"
            >
              <Star className="mr-2 h-4 w-4 text-blue-600" />
              Add to My Decks
            </Button>
            
            <Button
              variant={isFollowing ? "default" : "outline"}
              onClick={handleToggleFollow}
              disabled={isUpdatingFollowStatus}
              className={cn(
                tertiaryButtonClass, 
                isFollowing && "bg-green-50 border-green-200 hover:bg-green-100"
              )}
              size="sm"
            >
              {isFollowing ? (
                <>
                  <BellOff className="mr-2 h-4 w-4 text-green-600" />
                  Unfollow
                </>
              ) : (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  Follow Deck
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default SummaryActions;
