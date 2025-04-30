
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookCopy, Bell, BellOff } from 'lucide-react';
import { Deck } from '@/types/deck';
import { useDeck } from '@/context/DeckContext';

interface SharingButtonsProps {
  deck: Deck;
  isCopying: boolean;
  isFollowing?: boolean;
  isTogglingFollow?: boolean;
  onCopy: () => Promise<void>;
  onFollow?: () => Promise<void>;
  onUnfollow?: () => Promise<void>;
}

export const SharingButtons = ({
  deck,
  isCopying,
  isFollowing = false,
  isTogglingFollow = false,
  onCopy,
  onFollow,
  onUnfollow,
}: SharingButtonsProps) => {
  
  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    await onCopy();
  };

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isFollowing && onUnfollow) {
      await onUnfollow();
    } else if (!isFollowing && onFollow) {
      await onFollow();
    }
  };

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="w-full flex items-center justify-center"
        disabled={isCopying}
        onClick={handleCopy}
      >
        <BookCopy className="mr-2 h-4 w-4" />
        {isCopying ? 'Saving to My Decks...' : 'Save to My Decks'}
      </Button>

      {onFollow && onUnfollow && (
        <Button
          variant={isFollowing ? "default" : "outline"}
          className={`w-full flex items-center justify-center ${
            isFollowing ? "bg-flashcard-primary hover:bg-flashcard-secondary" : ""
          }`}
          disabled={isTogglingFollow}
          onClick={handleToggleFollow}
        >
          {isFollowing ? (
            <>
              <BellOff className="mr-2 h-4 w-4" />
              {isTogglingFollow ? 'Updating...' : 'Unfollow Deck'}
            </>
          ) : (
            <>
              <Bell className="mr-2 h-4 w-4" />
              {isTogglingFollow ? 'Updating...' : 'Follow Deck'}
            </>
          )}
        </Button>
      )}
    </div>
  );
};
