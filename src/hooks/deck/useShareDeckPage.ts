
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeck } from '@/context/DeckContext';
import { handleError } from '@/utils/errorHandling';
import { Deck } from '@/types/deck';
import { toast } from 'sonner';

export const useShareDeckPage = (id: string | undefined) => {
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
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Share link copied to clipboard');
      }
    } catch (error) {
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
