
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useDeck } from '@/context/DeckContext';
import { useAuth } from '@/context/AuthContext';
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
  const { getDeck, refreshDecks } = useDeck();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [fetchedDeck, setFetchedDeck] = useState<Deck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    if (!id) {
      navigate('/dashboard');
      return;
    }
    
    // Load the deck
    const loadDeckData = async () => {
      setIsLoading(true);
      try {
        await refreshDecks();
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
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDeckData();
  }, [id, getDeck, navigate, isAuthenticated, refreshDecks]);

  if (!isAuthenticated || !id) return null;
  
  if (isLoading || !fetchedDeck) {
    return (
      <Layout>
        <div className="container py-12 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-flashcard-primary" />
          <p className="mt-4 text-muted-foreground">Loading deck...</p>
        </div>
      </Layout>
    );
  }
  
  const {
    title,
    setTitle,
    description,
    setDescription,
    isSaving,
    saveDeck
  } = useDeckEditor(id, fetchedDeck);

  const {
    isCardDialogOpen,
    setIsCardDialogOpen,
    currentCard,
    setCurrentCard,
    handleAddCard,
    handleUpdateCard,
    handleDeleteCard,
    handleDeleteCurrentCard
  } = useCardManager(id);

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
            isLoading={isLoading}
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
