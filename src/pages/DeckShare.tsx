
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useDeck } from '@/context/DeckContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft,
  Copy,
  Share2,
  QrCode,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode.react';
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
    if (!id) {
      navigate('/dashboard');
      return;
    }
    
    const loadDeckAndGenerateCode = async () => {
      setIsLoading(true);
      try {
        await refreshDecks();
        const fetchedDeck = getDeck(id);
        if (!fetchedDeck) {
          toast.error('Deck not found');
          navigate('/dashboard');
          return;
        }
        
        setDeck(fetchedDeck);
        
        // Generate share code
        const code = generateShareCode(id);
        setShareCode(code);
        
        // Generate share URL
        const baseUrl = window.location.origin;
        setShareUrl(`${baseUrl}/shared/${code}`);
      } catch (error) {
        console.error('Error loading deck:', error);
        toast.error('Error loading deck information');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDeckAndGenerateCode();
  }, [id, getDeck, navigate, generateShareCode, refreshDecks]);
  
  if (!id || isLoading) {
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
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(shareCode);
    toast.success('Share code copied to clipboard');
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard');
  };
  
  const handleShareClick = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `FlashCards: ${deck.title}`,
          text: `Check out my flashcard deck: ${deck.title}`,
          url: shareUrl,
        });
      } else {
        handleCopyLink();
      }
    } catch (error) {
      console.error('Error sharing:', error);
      handleCopyLink();
    }
  };

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
          <div>
            <h2 className="text-lg font-semibold mb-4">Share Options</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Share Code:</p>
                <div className="flex">
                  <div className="bg-muted flex-1 p-2 rounded-l-md font-mono">
                    {shareCode}
                  </div>
                  <Button 
                    variant="outline" 
                    className="rounded-l-none" 
                    onClick={handleCopyCode}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Share Link:</p>
                <div className="flex">
                  <div className="bg-muted flex-1 p-2 rounded-l-md truncate text-xs sm:text-sm">
                    {shareUrl}
                  </div>
                  <Button 
                    variant="outline" 
                    className="rounded-l-none" 
                    onClick={handleCopyLink}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="pt-2">
                <Button 
                  className="w-full bg-flashcard-primary hover:bg-flashcard-secondary"
                  onClick={handleShareClick}
                >
                  <Share2 className="mr-2 h-4 w-4" /> 
                  Share Deck
                </Button>
              </div>
              
              <div>
                <Button variant="outline" className="w-full" onClick={() => navigate(`/shared/${shareCode}`)}>
                  <ExternalLink className="mr-2 h-4 w-4" /> 
                  Preview Shared View
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <div className="mb-4">
              <QrCode className="h-6 w-6 text-flashcard-primary" />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <QRCode value={shareUrl} size={180} renderAs="svg" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Scan to access this deck
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DeckShare;
