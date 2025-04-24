
import { Button } from "@/components/ui/button";
import { BookOpen, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Deck } from "@/types/deck";

interface StudyButtonsProps {
  deck: Deck;
  shareCode?: string;
}

export const StudyButtons = ({ deck, shareCode }: StudyButtonsProps) => {
  const navigate = useNavigate();
  const isSharedView = !!shareCode;
  
  return (
    <div className="space-y-4">
      <Button 
        className="w-full justify-start bg-flashcard-primary hover:bg-flashcard-secondary"
        onClick={() => {
          if (isSharedView) {
            navigate(`/shared/${shareCode}/practice`);
          } else {
            navigate(`/deck/${deck.id}/practice`);
          }
        }}
      >
        <BookOpen className="mr-2 h-4 w-4" /> 
        Practice Mode
        <span className="text-xs opacity-70 ml-auto">Learn at your own pace</span>
      </Button>
      
      <Button 
        className="w-full justify-start"
        onClick={() => {
          if (isSharedView) {
            navigate(`/shared/${shareCode}/test`);
          } else {
            navigate(`/deck/${deck.id}/test`);
          }
        }}
      >
        <Play className="mr-2 h-4 w-4" /> 
        Test Mode
        <span className="text-xs opacity-70 ml-auto">Challenge yourself</span>
      </Button>
    </div>
  );
};
