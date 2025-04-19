
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/auth';
import { Loader2 } from 'lucide-react';
import CardDialog from '@/components/deck/CardDialog';
import { useDeckEditor } from '@/hooks/deck/useDeckEditor';
import { useCardManager } from '@/hooks/deck/useCardManager';
import { useCardRealtime } from '@/hooks/deck/useCardRealtime';
import { useDeckData } from '@/hooks/deck/useDeckData';
import { useVisibilityRefresh } from '@/hooks/deck/useVisibilityRefresh';
import DeckEditHeader from '@/components/deck/edit/DeckEditHeader';
import DeckEditLayout from '@/components/deck/edit/DeckEditLayout';

const DeckEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const deckId = id || '';
  
  const {
    fetchedDeck,
    loading,
    lastRefreshTime,
    throttledRefresh
  } = useDeckData(deckId);
  
  const {
    title,
    setTitle,
    description,
    setDescription,
    isSaving,
    isLoading: isEditorLoading,
    saveDeck
  } = useDeckEditor(deckId, fetchedDeck);

  const {
    isCardDialogOpen,
    setIsCardDialogOpen,
    currentCard,
    setCurrentCard,
    handleAddCard,
    handleUpdateCard,
    handleDeleteCard,
    handleDeleteCurrentCard,
    isSubmitting
  } = useCardManager(deckId);
  
  const handleCardChange = React.useCallback(() => {
    console.log('Card change detected, triggering throttled refresh');
    throttledRefresh();
  }, [throttledRefresh]);
  
  const { isSubscribed } = useCardRealtime(deckId, handleCardChange);
  
  useVisibilityRefresh(throttledRefresh, lastRefreshTime);

  React.useEffect(() => {
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to auth page');
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }
  
  const isPageLoading = loading || isEditorLoading;
  
  if (isPageLoading || !fetchedDeck) {
    return (
      <Layout>
        <div className="container py-12 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-flashcard-primary" />
          <p className="mt-4 text-muted-foreground">Loading deck...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <DeckEditHeader />
        
        <DeckEditLayout
          deck={fetchedDeck}
          title={title}
          description={description}
          isSaving={isSaving}
          isLoading={isPageLoading}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onSaveDeck={saveDeck}
          onAddCard={() => {
            setCurrentCard(undefined);
            setIsCardDialogOpen(true);
          }}
          onEditCard={(cardId) => {
            const card = fetchedDeck.cards.find(c => c.id === cardId);
            if (card) {
              setCurrentCard(card);
              setIsCardDialogOpen(true);
            }
          }}
          onDeleteCard={handleDeleteCard}
          onRefreshRequest={throttledRefresh}
        />
        
        <CardDialog
          open={isCardDialogOpen}
          onOpenChange={setIsCardDialogOpen}
          card={currentCard}
          onSubmit={currentCard ? handleUpdateCard : handleAddCard}
          onCancel={() => setIsCardDialogOpen(false)}
          onDelete={currentCard ? handleDeleteCurrentCard : undefined}
          isSubmitting={isSubmitting}
        />
      </div>
    </Layout>
  );
};

export default DeckEdit;
