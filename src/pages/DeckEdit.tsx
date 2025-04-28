
import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/auth';
import { Loader2 } from 'lucide-react';
import CardDialog from '@/components/deck/CardDialog';
import { useDeckEditor } from '@/hooks/deck/useDeckEditor';
import { useCardManager } from '@/hooks/deck/useCardManager';
import { useDeckData } from '@/hooks/deck/useDeckData';
import DeckEditHeader from '@/components/deck/edit/DeckEditHeader';
import DeckEditLayout from '@/components/deck/edit/DeckEditLayout';
import { toast } from 'sonner';
import { useDeck } from '@/context/DeckContext';
import { Deck } from '@/types/deck';

const DeckEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const deckId = id || '';
  const { refreshDecks, getDeck } = useDeck();
  
  // Local state to force re-render when cards change
  const [localUpdateTrigger, setLocalUpdateTrigger] = useState<number>(0);
  
  // State to track if a manual refresh is in progress
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Manual refresh function with more reliable updating
  const manualRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      console.log('Manual refresh requested from DeckEdit page');
      // Always bypass throttling for manual refresh
      await refreshDecks(true);
      
      // Force local update after refresh
      setLocalUpdateTrigger(prev => prev + 1);
      
      toast.success('Deck refreshed successfully');
    } catch (error) {
      console.error('Error during manual refresh:', error);
      toast.error('Failed to refresh deck');
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshDecks, isRefreshing]);
  
  // Get initial deck data
  const {
    fetchedDeck,
    loading,
    refreshDeck,
    updateLocalDeck
  } = useDeckData(deckId, false, localUpdateTrigger); // Pass false to disable auto-refresh
  
  const {
    title,
    setTitle,
    description,
    setDescription,
    isSaving,
    isLoading: isEditorLoading,
    saveDeck
  } = useDeckEditor(deckId, fetchedDeck);

  // Handle operations completion by refreshing the deck
  const handleOperationComplete = useCallback(async () => {
    console.log('Operation completed, refreshing deck data');
    
    try {
      // Bypass throttling after operations
      await refreshDecks(true);
      
      // Force local update
      const currentDeck = getDeck(deckId);
      if (currentDeck) {
        console.log('Updating local deck after operation with latest data');
        updateLocalDeck(currentDeck);
        setLocalUpdateTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error refreshing after operation:', error);
    }
  }, [refreshDecks, getDeck, deckId, updateLocalDeck]);

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
  } = useCardManager(deckId, handleOperationComplete);
  
  // Listen for deck changes and update local state
  useEffect(() => {
    if (!deckId) return;
    
    const currentDeck = getDeck(deckId);
    if (currentDeck) {
      updateLocalDeck(currentDeck);
    }
  }, [getDeck, deckId, updateLocalDeck, localUpdateTrigger]);
  
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
          isLoading={isPageLoading || isRefreshing}
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
          onManualRefresh={manualRefresh}
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
