
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Deck } from '@/types/deck';
import { StudyButtons } from './study-options/StudyButtons';
import { SharingButtons } from './sharing/SharingButtons';
import { AuthPrompt } from './auth/AuthPrompt';

interface SharedDeckActionsProps {
  deck: Deck;
  isCopying: boolean;
  isAuthenticated: boolean;
  onCopy: () => Promise<void>;
}

export const SharedDeckActions = ({
  deck,
  isCopying,
  isAuthenticated,
  onCopy,
}: SharedDeckActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <StudyButtons deck={deck} />
        <SharingButtons deck={deck} isCopying={isCopying} onCopy={onCopy} />
        {!isAuthenticated && <AuthPrompt />}
      </CardContent>
    </Card>
  );
};
