
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Deck } from '@/types/deck';

interface DeckInfoCardProps {
  deck: Deck;
}

export const DeckInfoCard = ({ deck }: DeckInfoCardProps) => (
  <Card className="mb-6">
    <CardContent className="p-6">
      <h2 className="text-xl font-semibold mb-2">{deck.title}</h2>
      {deck.description && <p className="text-muted-foreground mb-4">{deck.description}</p>}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{deck.cards.length} cards</span>
        <span>Created {new Date(deck.created_at).toLocaleDateString()}</span>
      </div>
    </CardContent>
  </Card>
);
