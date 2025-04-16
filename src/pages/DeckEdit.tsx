
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useDeck } from '@/context/DeckContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import CardForm from '@/components/deck/CardForm';
import CardList from '@/components/deck/CardList';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Flashcard } from '@/context/DeckContext';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { toast } from 'sonner';

const DeckEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { getDeck, updateDeck, addCardToDeck, updateCard, deleteCard } = useDeck();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [currentCard, setCurrentCard] = useState<Flashcard | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  
  // Effect for loading the deck
  React.useEffect(() => {
    if (id) {
      const deck = getDeck(id);
      if (deck) {
        setTitle(deck.title);
        setDescription(deck.description || '');
      } else {
        toast.error('Deck not found');
        navigate('/dashboard');
      }
    }
  }, [id, getDeck, navigate]);
  
  if (!isAuthenticated) {
    navigate('/auth');
    return null;
  }
  
  if (!id) {
    navigate('/dashboard');
    return null;
  }
  
  const deck = getDeck(id);
  if (!deck) return null;
  
  const handleSave = async () => {
    if (!title) {
      toast.error('Title is required');
      return;
    }
    
    setIsSaving(true);
    try {
      await updateDeck(id, title, description);
      toast.success('Deck updated successfully');
    } catch (error) {
      toast.error('Failed to update deck');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAddCard = (cardData: Omit<Flashcard, 'id' | 'created_at'>) => {
    addCardToDeck(id, cardData);
    setIsCardDialogOpen(false);
    setCurrentCard(undefined);
  };
  
  const handleUpdateCard = (cardData: Omit<Flashcard, 'id' | 'created_at'>) => {
    if (!currentCard) return;
    updateCard(id, currentCard.id, cardData);
    setIsCardDialogOpen(false);
    setCurrentCard(undefined);
  };
  
  const handleEditCard = (cardId: string) => {
    const card = deck.cards.find(c => c.id === cardId);
    if (card) {
      setCurrentCard(card);
      setIsCardDialogOpen(true);
    }
  };
  
  const handleDeleteCard = (cardId: string) => {
    if (confirm('Are you sure you want to delete this card?')) {
      deleteCard(id, cardId);
    }
  };
  
  const handleDeleteCurrentCard = () => {
    if (!currentCard) return;
    if (confirm('Are you sure you want to delete this card?')) {
      deleteCard(id, currentCard.id);
      setIsCardDialogOpen(false);
      setCurrentCard(undefined);
    }
  };

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
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Deck title"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description (optional)
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A short description of this deck"
                rows={3}
              />
            </div>
            
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !title} 
              className="w-full bg-flashcard-primary hover:bg-flashcard-secondary"
            >
              <Save className="mr-1 h-4 w-4" /> 
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">Cards ({deck.cards.length})</h2>
              <Button 
                onClick={() => {
                  setCurrentCard(undefined);
                  setIsCardDialogOpen(true);
                }}
                className="bg-flashcard-primary hover:bg-flashcard-secondary"
              >
                <Plus className="mr-1 h-4 w-4" /> Add Card
              </Button>
            </div>
            
            <CardList
              cards={deck.cards}
              onEdit={handleEditCard}
              onDelete={handleDeleteCard}
            />
          </div>
        </div>
        
        <Dialog open={isCardDialogOpen} onOpenChange={setIsCardDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentCard ? 'Edit Card' : 'Add New Card'}</DialogTitle>
            </DialogHeader>
            <CardForm
              card={currentCard}
              onSubmit={currentCard ? handleUpdateCard : handleAddCard}
              onCancel={() => setIsCardDialogOpen(false)}
              onDelete={currentCard ? handleDeleteCurrentCard : undefined}
            />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default DeckEdit;
