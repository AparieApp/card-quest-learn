
import { DecksUpdater } from '@/types/cardOperations';
import { useCardMutations } from './useCardMutations';

export const useCardOperations = (
  setDecks: DecksUpdater,
  userId?: string,
  onOperationComplete?: () => void
) => {
  const {
    addCardToDeck,
    updateCard,
    deleteCard
  } = useCardMutations(setDecks, userId, onOperationComplete);

  return {
    addCardToDeck,
    updateCard,
    deleteCard
  };
};
