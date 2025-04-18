
import React from 'react';
import { Flashcard } from '@/types/deck';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';

interface CardListProps {
  cards: Flashcard[];
  onEdit: (cardId: string) => void;
  onDelete: (cardId: string) => void;
}

const CardList: React.FC<CardListProps> = ({ cards, onEdit, onDelete }) => {
  if (cards.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No cards in this deck yet. Add your first card to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cards.map((card) => (
        <Card key={card.id} className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium mb-1 break-words">{card.front_text}</h3>
                <p className="text-sm text-green-600 font-medium">{card.correct_answer}</p>
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Incorrect answers:</p>
                  <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                    {card.incorrect_answers.map((answer, i) => (
                      <li key={i} className="break-words">{answer}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={() => onEdit(card.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-red-500" 
                  onClick={() => onDelete(card.id)}
                >
                  <Trash className="h-4 w-4" />
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
