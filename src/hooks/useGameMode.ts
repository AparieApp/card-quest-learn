
import { GameMode } from '@/types/game';
import { useGameState } from './game/useGameState';
import { useDeckLoader } from './game/useDeckLoader';
import { useAnswerHandler } from './game/useAnswerHandler';
import { useReviewMode } from './game/useReviewMode';
import { useRemovePrompt } from './game/useRemovePrompt';

export const useGameMode = (deckId: string | undefined, mode: GameMode) => {
  const { state, setState } = useGameState();
  
  // Initialize deck loading
  useDeckLoader(deckId, setState);
  
  // Initialize handlers
  const handleAnswer = useAnswerHandler({ mode, setState });
  const startReviewMode = useReviewMode(setState);
  const handleRemoveCardPrompt = useRemovePrompt(setState);

  return {
    ...state,
    handleAnswer,
    startReviewMode,
    handleRemoveCardPrompt,
  };
};
