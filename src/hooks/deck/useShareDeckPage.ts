import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeck } from '@/context/DeckContext';
import { handleError } from '@/utils/errorHandling';
import { Deck } from '@/types/deck';
import { toast } from 'sonner';
import { deckService } from '@/services/deckService';

export const useShareDeckPage = (id: string | undefined) => {
  const navigate = useNavigate();
  const { generateShareCode } = useDeck();
  
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
        // Fetch only this one deck, without altering the global list
        const fetchedDeck = await deckService.getDeck(id);
        if (!fetchedDeck) throw new Error('Deck not found');
        
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
  }, [id, navigate, generateShareCode]);

  const handleShare = async () => {
    try {
      // Check if Web Share API is available AND the app is running in a secure context
      if (navigator.share && window.isSecureContext) {
        try {
          await navigator.share({
            title: `FlashCards: ${deck?.title}`,
            text: `Check out my flashcard deck: ${deck?.title}`,
            url: shareUrl,
          });
          toast.success('Deck shared successfully');
        } catch (error: any) {
          // If user aborts sharing or permission denied, fall back to clipboard
          console.log('Share API error, falling back to clipboard:', error);
          if (error.name !== 'AbortError') {
            await navigator.clipboard.writeText(shareUrl);
            toast.success('Share link copied to clipboard');
          }
        }
      } else {
        // Web Share API not available, use clipboard instead
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Share link copied to clipboard');
      }
    } catch (error) {
      console.error('Sharing failed:', error);
      handleError(error, 'Failed to share deck');
    }
  };

  return {
    deck,
    shareCode,
    shareUrl,
    isLoading,
    handleShare,
  };
};
