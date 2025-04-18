
import React, { useEffect, useState } from 'react';
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
import { Deck } from '@/types/deck';

const DeckEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { getDeck } = useDeck();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [fetchedDeck, setFetchedDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Always initialize hooks at the top level, even with potential default values
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
    handleDeleteCurrentCard
  } = useCardManager(deckId);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    if (!id) {
      navigate('/dashboard');
      return;
    }
    
    // Load the deck only once when the component mounts or id changes
    const loadDeckData = async () => {
      // Skip if we're already loading or if we already have the deck
      if (!loading || fetchedDeck) return;
      
      setLoading(true);
      try {
        const deck = getDeck(id);
        if (!deck) {
          toast.error('Deck not found');
          navigate('/dashboard');
          return;
        }
        setFetchedDeck(deck);
      } catch (error) {
        console.error('Error loading deck:', error);
        toast.error('Error loading deck');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    loadDeckData();
  }, [id, getDeck, navigate, isAuthenticated]);

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
          />
        </div>
        
        <CardDialog
          open={isCardDialogOpen}
          onOpenChange={setIsCardDialogOpen}
          card={currentCard}
          onSubmit={currentCard ? handleUpdateCard : handleAddCard}
          onCancel={() => setIsCardDialogOpen(false)}
          onDelete={currentCard ? handleDeleteCurrentCard : undefined}
        />
      </div>
    </Layout>
  );
};

export default DeckEdit;
