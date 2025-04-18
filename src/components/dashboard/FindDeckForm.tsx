
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDeck } from '@/context/DeckContext';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

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
    
    setIsSearching(true);
    
    try {
      // Clean up code (remove spaces, etc)
      const cleanCode = code.trim().toUpperCase();
      const deck = await getDeckByShareCode(cleanCode);
      
      if (deck) {
        navigate(`/shared/${cleanCode}`);
      } else {
        toast.error('Deck not found. Please check the code and try again.');
      }
    } catch (error) {
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
