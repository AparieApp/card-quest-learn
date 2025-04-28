
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDeck } from '@/context/DeckContext';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { validateShareCode } from '@/utils/secureValidation';
import { checkRateLimit } from '@/utils/secureValidation';

const FindDeckForm: React.FC = () => {
  const [code, setCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { getDeckByShareCode } = useDeck();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast.error('Please enter a deck code');
      return;
    }
    
    // Check rate limit
    if (!checkRateLimit('find_deck', 10, 60000)) {
      toast.error('Too many search attempts. Please try again later.');
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Validate and clean up code
      let validCode: string;
      try {
        validCode = validateShareCode(code);
      } catch (error) {
        toast.error('Invalid deck code format');
        setIsSearching(false);
        return;
      }
      
      const deck = await getDeckByShareCode(validCode);
      
      if (deck) {
        navigate(`/shared/${validCode}`);
      } else {
        toast.error('Deck not found. Please check the code and try again.');
      }
    } catch (error) {
      console.error('Error finding deck:', error);
      toast.error('An error occurred while searching for the deck');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm items-center space-x-2">
      <Input
        type="text"
        placeholder="Enter deck code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" disabled={isSearching} className="bg-flashcard-primary hover:bg-flashcard-secondary">
        {isSearching ? (
          'Searching...'
        ) : (
          <>
            <Search className="h-4 w-4 mr-1" /> Find
          </>
        )}
      </Button>
    </form>
  );
};

export default FindDeckForm;
