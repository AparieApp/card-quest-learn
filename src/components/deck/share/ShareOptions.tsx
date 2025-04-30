
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { handleError } from '@/utils/errorHandling';

interface ShareOptionsProps {
  shareCode: string;
  shareUrl: string;
  onShare: () => Promise<void>;
}

export const ShareOptions = ({ shareCode, shareUrl, onShare }: ShareOptionsProps) => {
  const handleCopyCode = () => {
    try {
      navigator.clipboard.writeText(shareCode);
      toast.success('Share code copied to clipboard');
    } catch (error) {
      handleError(error, 'Failed to copy share code');
    }
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard');
    } catch (error) {
      handleError(error, 'Failed to copy share link');
    }
  };

  return (
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
      </div>
    </div>
  );
};
