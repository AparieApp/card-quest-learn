
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';

interface DeckEditFormProps {
  title: string;
  description: string;
  isSaving: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSave: () => void;
}

const DeckEditForm: React.FC<DeckEditFormProps> = ({
  title,
  description,
  isSaving,
  onTitleChange,
  onDescriptionChange,
  onSave
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
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
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="A short description of this deck"
          rows={3}
        />
      </div>
      
      <Button 
        onClick={onSave} 
        disabled={isSaving || !title} 
        className="w-full bg-flashcard-primary hover:bg-flashcard-secondary"
      >
        <Save className="mr-1 h-4 w-4" /> 
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
};

export default DeckEditForm;
