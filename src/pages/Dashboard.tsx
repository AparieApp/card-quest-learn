import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDeck } from '@/context/DeckContext';
import DeckGrid from '@/components/dashboard/DeckGrid';
import CreateDeckButton from '@/components/dashboard/CreateDeckButton';
import FindDeckForm from '@/components/dashboard/FindDeckForm';
import { useAuth } from '@/context/auth';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFollowedDecks } from '@/hooks/useFollowedDecks';

const Dashboard = () => {
  const { decks = [], favorites = [], loading, deleteDeck, toggleFavorite } = useDeck();
  const { followedDecks = [], loading: followedLoading } = useFollowedDecks();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState('decks');
  const isMobile = useIsMobile();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <Layout>
        <div className="container flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-flashcard-primary" />
        </div>
      </Layout>
    );
  }

  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Get username from user object (already provided by auth context)
  const username = user?.username || 'User';
  
  // Safely filter favorited decks, ensuring decks and favorites are arrays
  const favoritedDecks = Array.isArray(decks) && Array.isArray(favorites) 
    ? decks.filter(deck => favorites.includes(deck.id)) 
    : [];

  return (
    <Layout>
      <div className="container py-4 sm:py-6 space-y-4 sm:space-y-6 px-4 md:px-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-responsive-xl font-bold mb-1 truncate">
              Welcome, {username}!
            </h1>
            <p className="text-muted-foreground text-responsive-sm">Manage your decks</p>
          </div>
          <div className="w-full sm:w-auto flex-shrink-0">
            <CreateDeckButton />
          </div>
        </div>
        
        {/* Tabs Section */}
        <div className="w-full">
          <Tabs 
            defaultValue="decks" 
            className="w-full" 
            value={activeTab} 
            onValueChange={setActiveTab}
          >
            <div className="sticky top-16 bg-background/95 backdrop-blur pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:static md:bg-transparent md:backdrop-blur-none">
              <TabsList className={`
                ${isMobile 
                  ? 'w-full grid grid-cols-4 h-auto p-1' 
                  : 'inline-flex h-10'
                }
                bg-muted/50 rounded-lg
              `}>
                <TabsTrigger 
                  value="decks" 
                  className={`
                    ${isMobile ? 'text-xs px-1 py-2' : 'text-sm px-3 py-1.5'}
                    data-[state=active]:bg-background
                    data-[state=active]:text-flashcard-primary
                    transition-all duration-200
                  `}
                >
                  My Decks
                </TabsTrigger>
                <TabsTrigger 
                  value="favorites"
                  className={`
                    ${isMobile ? 'text-xs px-1 py-2' : 'text-sm px-3 py-1.5'}
                    data-[state=active]:bg-background
                    data-[state=active]:text-flashcard-primary
                    transition-all duration-200
                  `}
                >
                  Favorites
                </TabsTrigger>
                <TabsTrigger 
                  value="followed"
                  className={`
                    ${isMobile ? 'text-xs px-1 py-2' : 'text-sm px-3 py-1.5'}
                    data-[state=active]:bg-background
                    data-[state=active]:text-flashcard-primary
                    transition-all duration-200
                  `}
                >
                  Followed
                </TabsTrigger>
                <TabsTrigger 
                  value="find"
                  className={`
                    ${isMobile ? 'text-xs px-1 py-2' : 'text-sm px-3 py-1.5'}
                    data-[state=active]:bg-background
                    data-[state=active]:text-flashcard-primary
                    transition-all duration-200
                  `}
                >
                  Find Deck
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Tab Content */}
            <div className="mt-4 sm:mt-6">
              <TabsContent value="decks" className="mt-0">
                {loading ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-6 w-6 mr-2 animate-spin text-flashcard-primary" />
                    <p className="text-responsive-sm">Loading decks...</p>
                  </div>
                ) : (
                  <DeckGrid 
                    decks={Array.isArray(decks) ? decks : []} 
                    emptyMessage="You haven't created any decks yet. Click 'Create Deck' to get started."
                    onDeleteDeck={deleteDeck}
                    onToggleFavorite={toggleFavorite}
                    favoritesArray={favorites}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="favorites" className="mt-0">
                {loading ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-6 w-6 mr-2 animate-spin text-flashcard-primary" />
                    <p className="text-responsive-sm">Loading favorites...</p>
                  </div>
                ) : (
                  <DeckGrid 
                    decks={favoritedDecks} 
                    emptyMessage="You haven't favorited any decks yet."
                    onDeleteDeck={deleteDeck}
                    onToggleFavorite={toggleFavorite}
                    favoritesArray={favorites}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="followed" className="mt-0">
                {followedLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-6 w-6 mr-2 animate-spin text-flashcard-primary" />
                    <p className="text-responsive-sm">Loading followed decks...</p>
                  </div>
                ) : (
                  <DeckGrid 
                    decks={Array.isArray(followedDecks) ? followedDecks : []} 
                    emptyMessage="You haven't followed any decks yet."
                    isFollowed={true}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="find" className="mt-0">
                <div className="flex justify-center pt-4 sm:pt-8">
                  <div className="text-center space-y-4 w-full max-w-md mx-auto px-4">
                    <h2 className="text-responsive-lg font-semibold">
                      Find a Shared Deck
                    </h2>
                    <p className="text-muted-foreground text-responsive-sm max-w-md mx-auto">
                      Enter a deck code shared with you to access the flashcards.
                    </p>
                    <div className="flex justify-center pt-2">
                      <FindDeckForm />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
