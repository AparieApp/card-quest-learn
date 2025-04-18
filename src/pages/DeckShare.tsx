import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useDeck } from '@/context/DeckContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { ShareOptions } from '@/components/deck/share/ShareOptions';
import { QRCodeDisplay } from '@/components/deck/share/QRCodeDisplay';
import { handleError } from '@/utils/errorHandling';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Deck } from '@/types/deck';

const DeckShare = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDeck, generateShareCode, refreshDecks } = useDeck();
  
  const [shareCode, setShareCode] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [deck, setDeck] = useState<Deck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadDeckAndGenerateCode = async () => {
      if (!id) {
        navigate('/dashboard');
        return;
      }
      
      setIsLoading(true);
      try {
        await refreshDecks();
        const fetchedDeck = getDeck(id);
        if (!fetchedDeck) {
          throw new Error('Deck not found');
        }
        
        setDeck(fetchedDeck);
        
        const code = generateShareCode(id);
        setShareCode(code);
        
        const baseUrl = window.location.origin;
        setShareUrl(`${baseUrl}/shared/${code}`);
      } catch (error) {
        handleError(error, 'Error loading deck information');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDeckAndGenerateCode();
  }, [id, getDeck, navigate, generateShareCode, refreshDecks]);
  
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `FlashCards: ${deck?.title}`,
          text: `Check out my flashcard deck: ${deck?.title}`,
          url: shareUrl,
        });
      } else {
        navigator.clipboard.writeText(shareUrl);
        toast.success('Share link copied to clipboard');
      }
    } catch (error) {
      handleError(error, 'Failed to share deck');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-flashcard-primary" />
          <p className="mt-4 text-muted-foreground">Loading share information...</p>
        </div>
      </Layout>
    );
  }
  
  if (!deck) return null;

  return (
    <Layout>
      <div className="container py-6 max-w-xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/deck/${id}`)}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Share Deck</h1>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">{deck.title}</h2>
            {deck.description && <p className="text-muted-foreground mb-4">{deck.description}</p>}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{deck.cards.length} cards</span>
              <span>Created {new Date(deck.created_at).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid gap-6 md:grid-cols-2">
          <ShareOptions 
            shareCode={shareCode}
            shareUrl={shareUrl}
            onShare={handleShare}
          />
          <QRCodeDisplay shareUrl={shareUrl} />
        </div>
        
        <div className="mt-4">
          <Button variant="outline" className="w-full" onClick={() => navigate(`/shared/${shareCode}`)}>
            <ExternalLink className="mr-2 h-4 w-4" /> 
            Preview Shared View
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default DeckShare;
