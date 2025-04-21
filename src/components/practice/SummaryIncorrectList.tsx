
import React from "react";
import { XCircle, Star } from "lucide-react";
import { Flashcard } from "@/types/deck";

interface SummaryIncorrectListProps {
  incorrectCards: Flashcard[];
}

const SummaryIncorrectList: React.FC<SummaryIncorrectListProps> = ({
  incorrectCards,
}) => {
  if (incorrectCards.length > 0) {
    return (
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {incorrectCards.map((card) => (
          <div key={card.id} className="flex items-start p-3 border rounded-md">
            <XCircle className="h-5 w-5 text-red-500 shrink-0 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">{card.front_text}</p>
              <p className="text-sm text-green-600">
                <span className="font-medium">Correct answer:</span> {card.correct_answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex justify-center items-center py-8">
      <div className="flex flex-col items-center">
        <Star className="h-12 w-12 text-yellow-400 mb-2" />
        <p className="text-lg">You answered all cards correctly!</p>
      </div>
    </div>
  );
};

export default SummaryIncorrectList;
