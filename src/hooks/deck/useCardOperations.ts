
import { DecksUpdater } from '@/types/cardOperations';
import { useCardMutations } from './useCardMutations';

export const useCardOperations = (
  setDecks: DecksUpdater,
  userId?: string
) => {
  const {
    addCardToDeck,
    updateCard,
    deleteCard,
    isOptimisticUpdating
  } = useCardMutations(setDecks, userId);

  return {
    addCardToDeck,
    updateCard,
    deleteCard,
    isOptimisticUpdating
  };
};
