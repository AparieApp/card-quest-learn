
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Deck } from '@/types/deck';
import { StudyButtons } from './study-options/StudyButtons';
import { SharingButtons } from './sharing/SharingButtons';
import { AuthPrompt } from './auth/AuthPrompt';
import { FollowBadge } from './FollowBadge';

interface SharedDeckActionsProps {
  deck: Deck;
  shareCode: string;
  isCopying: boolean;
  isAuthenticated: boolean;
  isFollowing: boolean;
  isTogglingFollow: boolean;
  onCopy: () => Promise<void>;
  onFollow: () => Promise<void>;
  onUnfollow: () => Promise<void>;
}

export const SharedDeckActions = ({
  deck,
  shareCode,
  isCopying,
  isAuthenticated,
  isFollowing,
  isTogglingFollow,
  onCopy,
  onFollow,
  onUnfollow,
}: SharedDeckActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          Study Options
          <FollowBadge isFollowing={isFollowing} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <StudyButtons deck={deck} shareCode={shareCode} />
        <SharingButtons 
          deck={deck} 
          isCopying={isCopying} 
          isFollowing={isFollowing}
          isTogglingFollow={isTogglingFollow}
          onCopy={onCopy}
          onFollow={isAuthenticated ? onFollow : undefined}
          onUnfollow={isAuthenticated ? onUnfollow : undefined}
        />
        {!isAuthenticated && <AuthPrompt />}
      </CardContent>
    </Card>
  );
};
