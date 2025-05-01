import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Deck } from '@/types/deck';
import { StudyButtons } from './study-options/StudyButtons';
import { SharingButtons } from './sharing/SharingButtons';
import { AuthPrompt } from './auth/AuthPrompt';

interface SharedDeckActionsProps {
  deck: Deck;
  shareCode: string;
  isCopying: boolean;
  isAuthenticated: boolean;
  isFollowing: boolean;
  onCopy: () => Promise<void>;
  onFollow: () => Promise<void>;
}

export const SharedDeckActions = ({
  deck,
  shareCode,
  isCopying,
  isAuthenticated,
  isFollowing,
  onCopy,
  onFollow,
}: SharedDeckActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <StudyButtons deck={deck} shareCode={shareCode} />
        <SharingButtons 
          deck={deck} 
          isCopying={isCopying} 
          onCopy={onCopy} 
          isFollowing={isFollowing} 
          onFollow={onFollow}
        />
        {!isAuthenticated && <AuthPrompt />}
      </CardContent>
    </Card>
  );
};
