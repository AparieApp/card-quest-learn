
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { SharedDeckHeader } from '@/components/shared-deck/SharedDeckHeader';
import { SharedDeckDetails } from '@/components/shared-deck/SharedDeckDetails';
import { SharedDeckActions } from '@/components/shared-deck/SharedDeckActions';
import { SharedDeckPreview } from '@/components/shared-deck/SharedDeckPreview';
import { useSharedDeck } from '@/hooks/useSharedDeck';

const SharedDeck = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const {
    deck,
    isLoading,
    isCopying,
    isTogglingFollow,
    isAuthenticated,
    isFavorite,
    isFollowing,
    handleFavorite,
    handleCopyDeck,
    handleFollowDeck,
    handleUnfollowDeck,
  } = useSharedDeck(code);
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-flashcard-primary" />
          <p className="mt-4 text-muted-foreground">Loading shared deck...</p>
        </div>
      </Layout>
    );
  }
  
  if (!deck) {
    return (
      <Layout>
        <div className="container py-12 flex flex-col items-center justify-center">
          <div className="text-center space-y-4 max-w-md mx-auto">
            <h1 className="text-3xl font-bold">Deck Not Found</h1>
            <p className="text-muted-foreground">
              This shared deck code is not valid or may have expired.
            </p>
            <Button onClick={() => navigate('/')}>
              Return Home
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6">
        <SharedDeckHeader />
        
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <SharedDeckDetails
              deck={deck}
              isFavorite={isFavorite}
              isAuthenticated={isAuthenticated}
              onFavorite={handleFavorite}
            />
          </div>
          
          <div className="lg:col-span-2">
            <SharedDeckActions
              deck={deck}
              shareCode={code || ''}
              isCopying={isCopying}
              isAuthenticated={isAuthenticated}
              isFollowing={isFollowing}
              isTogglingFollow={isTogglingFollow}
              onCopy={handleCopyDeck}
              onFollow={handleFollowDeck}
              onUnfollow={handleUnfollowDeck}
            />
          </div>
        </div>
        
        <SharedDeckPreview cards={deck.cards} />
      </div>
    </Layout>
  );
};

export default SharedDeck;
