
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash, Loader2 } from 'lucide-react';

interface FormActionsProps {
  onCancel?: () => void;
  onDelete?: () => void;
  isSubmitting?: boolean;
  isEditMode?: boolean;
}

export const FormActions = ({ 
  onCancel, 
  onDelete, 
  isSubmitting,
  isEditMode
}: FormActionsProps) => (
  <div className="flex justify-between pt-4">
    <div className="flex gap-2">
      {onCancel && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      )}
      {onDelete && (
        <Button 
          type="button" 
          variant="destructive" 
          onClick={onDelete}
          disabled={isSubmitting}
        >
          <Trash className="h-4 w-4 mr-1" /> Delete
        </Button>
      )}
    </div>
    <Button 
      type="submit" 
      className="bg-flashcard-primary hover:bg-flashcard-secondary"
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isEditMode ? 'Updating...' : 'Adding...'}
        </>
      ) : (
        isEditMode ? 'Update Card' : 'Add Card'
      )}
    </Button>
  </div>
);
