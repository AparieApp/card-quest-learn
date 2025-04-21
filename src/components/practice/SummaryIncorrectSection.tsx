
import React from "react";
import { Flashcard } from "@/types/deck";
import SummaryIncorrectList from "./SummaryIncorrectList";

interface SummaryIncorrectSectionProps {
  incorrectCards: Flashcard[];
}

const SummaryIncorrectSection: React.FC<SummaryIncorrectSectionProps> = ({
  incorrectCards,
}) => (
  <div className="bg-white rounded-lg p-6 shadow-md">
    <h2 className="text-xl font-semibold mb-4">
      {incorrectCards.length > 0
        ? `Review These Cards (${incorrectCards.length})`
        : "Perfect Score! 🎉"}
    </h2>
    <SummaryIncorrectList incorrectCards={incorrectCards} />
  </div>
);

export default SummaryIncorrectSection;
