
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DeckEditHeader = () => {
  const navigate = useNavigate();
  
  return (
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
  );
};

export default DeckEditHeader;
