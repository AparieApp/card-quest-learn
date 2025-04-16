
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useDeck } from '@/context/DeckContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Play, 
  BookOpen, 
  Heart,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';

const SharedDeck = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { getDeckByShareCode, toggleFavorite, isFavorite } = useDeck();
  const { isAuthenticated } = useAuth();
  
  if (!code) {
    navigate('/');
    return null;
  }
  
  const deck = getDeckByShareCode(code);
  if (!deck) {
    return (
      <Layout>
        <div className="container py-12 flex flex-col items-center justify-center">
          <div className="text-center space-y-4 max-w-md mx-auto">
            <h1 className="text-3xl font-bold">Deck Not Found</h1>
            <p className="text-muted-foreground">
              This shared deck code is not valid or may have expired.
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-flashcard-primary hover:bg-flashcard-secondary"
            >
              Return Home
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  const handleFavorite = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add decks to favorites', {
        action: {
          label: 'Login',
          onClick: () => navigate('/auth'),
        },
      });
      return;
    }
    
    toggleFavorite(deck.id);
  };
  
  const handleStartPractice = () => {
    navigate(`/deck/${deck.id}/practice`);
  };
  
  const handleStartTest = () => {
    navigate(`/deck/${deck.id}/test`);
  };

  return (
    <Layout>
      <div className="container py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Shared Deck</h1>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{deck.title}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-8 w-8" 
                    onClick={handleFavorite}
                  >
                    <Heart 
                      className={`h-5 w-5 ${isAuthenticated && isFavorite(deck.id) ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`} 
                    />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{deck.description || 'No description provided.'}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{deck.cards.length} cards</span>
                  <span>Created {new Date(deck.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Study Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full justify-start bg-flashcard-primary hover:bg-flashcard-secondary"
                  onClick={handleStartPractice}
                >
                  <BookOpen className="mr-2 h-4 w-4" /> 
                  Practice Mode
                  <span className="text-xs opacity-70 ml-auto">Learn at your own pace</span>
                </Button>
                
                <Button 
                  className="w-full justify-start"
                  onClick={handleStartTest}
                >
                  <Play className="mr-2 h-4 w-4" /> 
                  Test Mode
                  <span className="text-xs opacity-70 ml-auto">Challenge yourself</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    const shareUrl = window.location.href;
                    navigator.clipboard.writeText(shareUrl);
                    toast.success('Share link copied to clipboard');
                  }}
                >
                  <Share2 className="mr-2 h-4 w-4" /> 
                  Share This Deck
                </Button>
                
                {!isAuthenticated && (
                  <div className="pt-2 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Want to save this deck for later?
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/auth')}
                    >
                      Log in or Sign up
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Preview ({deck.cards.length} Cards)</h2>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {deck.cards.slice(0, 6).map(card => (
              <Card key={card.id}>
                <CardContent className="p-4">
                  <p className="font-medium mb-2">{card.front_text}</p>
                  <p className="text-sm text-green-600">{card.correct_answer}</p>
                </CardContent>
              </Card>
            ))}
            
            {deck.cards.length > 6 && (
              <div className="flex items-center justify-center min-h-[100px] border border-dashed rounded-lg">
                <p className="text-muted-foreground text-sm">
                  + {deck.cards.length - 6} more cards
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SharedDeck;
