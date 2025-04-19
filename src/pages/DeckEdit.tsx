
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useDeck } from '@/context/DeckContext';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import DeckEditForm from '@/components/deck/DeckEditForm';
import DeckCardManager from '@/components/deck/DeckCardManager';
import CardDialog from '@/components/deck/CardDialog';
import { useDeckEditor } from '@/hooks/deck/useDeckEditor';
import { useCardManager } from '@/hooks/deck/useCardManager';
import { useCardRealtime } from '@/hooks/deck/useCardRealtime';
import { Deck } from '@/types/deck';

const DeckEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { getDeck, refreshDecks } = useDeck();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [fetchedDeck, setFetchedDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  
  const deckId = id || '';
  
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
  
  // Throttled refresh function to prevent too many refreshes
  const throttledRefresh = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTime;
    
    // Only refresh if it's been at least 3 seconds since the last refresh
    if (timeSinceLastRefresh < 3000) {
      console.log('Throttling refresh, last refresh was', timeSinceLastRefresh, 'ms ago');
      return;
    }
    
    console.log('Executing throttled refresh');
    setLastRefreshTime(now);
    
    if (!deckId) return;
    
    try {
      await refreshDecks();
      // Update the local deck state after refresh
      const updatedDeck = getDeck(deckId);
      if (updatedDeck) {
        console.log('Updated deck data received:', updatedDeck.cards.length, 'cards');
        setFetchedDeck(updatedDeck);
      }
    } catch (error) {
      console.error('Error during throttled refresh:', error);
    }
  }, [deckId, refreshDecks, getDeck, lastRefreshTime]);
  
  // Callback to refresh deck data when cards change via realtime or direct operations
  const handleCardChange = useCallback(() => {
    console.log('Card change detected, triggering throttled refresh');
    throttledRefresh();
  }, [throttledRefresh]);
  
  // Set up realtime subscription
  const { isSubscribed } = useCardRealtime(deckId, handleCardChange);
  
  // Log subscription status for debugging
  useEffect(() => {
    console.log('Realtime subscription status:', isSubscribed ? 'active' : 'inactive');
  }, [isSubscribed]);

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to auth page');
      navigate('/auth');
      return;
    }
    
    if (!id) {
      console.log('No deck ID provided, redirecting to dashboard');
      navigate('/dashboard');
      return;
    }
    
    const loadDeckData = async () => {
      if (!loading && fetchedDeck) {
        console.log('Deck already loaded, skipping fetch');
        return;
      }
      
      setLoading(true);
      try {
        console.log('Loading deck data for ID:', id);
        // First try to get from context
        let deck = getDeck(id);
        
        if (!deck) {
          console.log('Deck not in context, refreshing decks');
          await refreshDecks();
          deck = getDeck(id);
        }
        
        if (!deck) {
          console.log('Deck not found after refresh');
          toast.error('Deck not found');
          navigate('/dashboard');
          return;
        }
        
        console.log('Deck loaded successfully:', deck.title, 'with', deck.cards.length, 'cards');
        setFetchedDeck(deck);
        setLastRefreshTime(Date.now());
      } catch (error) {
        console.error('Error loading deck:', error);
        toast.error('Error loading deck');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    loadDeckData();
  }, [id, getDeck, navigate, isAuthenticated, refreshDecks, loading, fetchedDeck]);

  // Optimize the effect for refreshing when returning to the page
  useEffect(() => {
    // Only add the visibility change listener, don't refresh on mount
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const timeSinceLastRefresh = Date.now() - lastRefreshTime;
        
        // Only refresh if it's been more than 30 seconds since the last refresh
        if (timeSinceLastRefresh > 30000) {
          console.log('Tab became visible and refresh needed (last refresh was over 30s ago)');
          throttledRefresh();
        } else {
          console.log('Tab became visible but refresh not needed (last refresh was', timeSinceLastRefresh, 'ms ago)');
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [throttledRefresh, lastRefreshTime]);

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
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Edit Deck</h1>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <DeckEditForm
            title={title}
            description={description}
            isSaving={isSaving}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onSave={saveDeck}
          />
          
          <DeckCardManager
            cards={fetchedDeck.cards}
            onAddClick={() => {
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
            isLoading={isPageLoading}
            deckId={deckId}
            onRefreshRequest={throttledRefresh}
          />
        </div>
        
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
