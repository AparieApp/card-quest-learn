
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Flashcard } from '@/types/deck';

interface SharedDeckPreviewProps {
  cards: Flashcard[];
}

export const SharedDeckPreview = ({ cards }: SharedDeckPreviewProps) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Preview ({cards.length} Cards)</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.slice(0, 6).map(card => (
          <Card key={card.id}>
            <CardContent className="p-4">
              <p className="font-medium mb-2">{card.front_text}</p>
              <p className="text-sm text-green-600">{card.correct_answer}</p>
            </CardContent>
          </Card>
        ))}
        
        {cards.length > 6 && (
          <div className="flex items-center justify-center min-h-[100px] border border-dashed rounded-lg">
            <p className="text-muted-foreground text-sm">
              + {cards.length - 6} more cards
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
