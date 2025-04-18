
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { Flashcard } from '@/types/deck';

export interface CardListProps {
  cards: Flashcard[];
  onEdit: (cardId: string) => void;
  onDelete: (cardId: string) => void;
  isLoading?: boolean;
  existingAnswers?: string[];
}

const CardList: React.FC<CardListProps> = ({ 
  cards, 
  onEdit, 
  onDelete, 
  isLoading = false, 
  existingAnswers = [] 
}) => {
  if (cards.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        {isLoading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Loading cards...</p>
          </div>
        ) : (
          <p className="text-muted-foreground">No cards yet. Add your first card to get started!</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cards.map((card) => (
        <Card key={card.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium mb-2">{card.front_text}</p>
                <div className="mt-2">
                  <p className="text-sm text-green-600">✓ {card.correct_answer}</p>
                  {card.manual_incorrect_answers.map((answer, index) => (
                    <p key={`manual-${index}`} className="text-sm text-red-600">✗ {answer}</p>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => onEdit(card.id)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(card.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CardList;
