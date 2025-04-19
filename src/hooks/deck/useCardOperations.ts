
import { DecksUpdater } from '@/types/cardOperations';
import { useCardMutations } from './useCardMutations';
import { useOptimisticUpdates } from './useOptimisticUpdates';

export const useCardOperations = (
  setDecks: DecksUpdater,
  userId?: string,
  onOperationComplete?: () => void
) => {
  const optimisticState = useOptimisticUpdates();
  const {
    addCardToDeck,
    updateCard,
    deleteCard
  } = useCardMutations(setDecks, userId, onOperationComplete, optimisticState);

  return {
    addCardToDeck,
    updateCard,
    deleteCard,
    isOptimisticUpdating: optimisticState.isOptimisticUpdating
  };
};
