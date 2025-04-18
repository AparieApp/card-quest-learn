
import React from 'react';
import { Loader2 } from 'lucide-react';

export const SharePageLoading = () => (
  <div className="container py-12 flex flex-col items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-flashcard-primary" />
    <p className="mt-4 text-muted-foreground">Loading share information...</p>
  </div>
);
