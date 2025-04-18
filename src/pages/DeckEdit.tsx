
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useDeck } from '@/context/DeckContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import DeckEditForm from '@/components/deck/DeckEditForm';
import DeckCardManager from '@/components/deck/DeckCardManager';
import CardDialog from '@/components/deck/CardDialog';
import { useDeckEditor } from '@/hooks/deck/useDeckEditor';
import { useCardManager } from '@/hooks/deck/useCardManager';

const DeckEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { getDeck } = useDeck();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    navigate('/auth');
    return null;
  }
  
  if (!id) {
    navigate('/dashboard');
    return null;
  }

  const {
    title,
    setTitle,
    description,
    setDescription,
    isSaving,
    loadDeck,
    saveDeck
  } = useDeckEditor(id);

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
  
  useEffect(() => {
    const deck = loadDeck();
    if (!deck) {
      toast.error('Deck not found');
      navigate('/dashboard');
    }
  }, [id]);
  
  const deck = getDeck(id);
  if (!deck) return null;

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
            cards={deck.cards}
            onAddClick={() => {
              setCurrentCard(undefined);
              setIsCardDialogOpen(true);
            }}
            onEditCard={(cardId) => {
              const card = deck.cards.find(c => c.id === cardId);
              if (card) {
                setCurrentCard(card);
                setIsCardDialogOpen(true);
              }
            }}
            onDeleteCard={handleDeleteCard}
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
