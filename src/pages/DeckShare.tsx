
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { ShareOptions } from '@/components/deck/share/ShareOptions';
import { QRCodeDisplay } from '@/components/deck/share/QRCodeDisplay';
import { SharePageLoading } from '@/components/deck/share/SharePageLoading';
import { DeckInfoCard } from '@/components/deck/share/DeckInfoCard';
import { useShareDeckPage } from '@/hooks/deck/useShareDeckPage';

const DeckShare = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    deck,
    shareCode,
    shareUrl,
    isLoading,
    handleShare,
  } = useShareDeckPage(id);

  if (isLoading) {
    return (
      <Layout>
        <SharePageLoading />
      </Layout>
    );
  }
  
  if (!deck) return null;

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
        
        <DeckInfoCard deck={deck} />
        
        <div className="grid gap-6 md:grid-cols-2">
          <ShareOptions 
            shareCode={shareCode}
            shareUrl={shareUrl}
            onShare={handleShare}
          />
          <QRCodeDisplay shareUrl={shareUrl} />
        </div>
        
        <div className="mt-4">
          <Button variant="outline" className="w-full" onClick={() => navigate(`/shared/${shareCode}`)}>
            <ExternalLink className="mr-2 h-4 w-4" /> 
            Preview Shared View
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default DeckShare;
