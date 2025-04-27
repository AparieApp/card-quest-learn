
import { DecksUpdater, OptimisticUpdateState } from '@/types/cardOperations';
import { useAddCard } from './mutations/useAddCard';
import { useUpdateCard } from './mutations/useUpdateCard';
import { useDeleteCard } from './mutations/useDeleteCard';

export const useCardMutations = (
  setDecks: DecksUpdater, 
  userId?: string, 
  onOperationComplete?: () => void,
  optimisticState?: OptimisticUpdateState
) => {
  const addCardToDeck = useAddCard(setDecks, userId, onOperationComplete, optimisticState);
  const updateCard = useUpdateCard(setDecks, userId, onOperationComplete, optimisticState);
  const deleteCard = useDeleteCard(setDecks, userId, onOperationComplete, optimisticState);

  return {
    addCardToDeck,
    updateCard,
    deleteCard
  };
};
