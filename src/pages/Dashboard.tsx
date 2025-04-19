
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDeck } from '@/context/DeckContext';
import DeckGrid from '@/components/dashboard/DeckGrid';
import CreateDeckButton from '@/components/dashboard/CreateDeckButton';
import FindDeckForm from '@/components/dashboard/FindDeckForm';
import { useAuth } from '@/context/auth';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { decks = [], favorites = [], loading } = useDeck();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState('decks');

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

  // Safely filter favorited decks, ensuring decks and favorites are arrays
  const favoritedDecks = Array.isArray(decks) && Array.isArray(favorites) 
    ? decks.filter(deck => favorites.includes(deck.id))
    : [];

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.username || 'User'}!</h1>
            <p className="text-muted-foreground">Manage your flashcard decks</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <CreateDeckButton />
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <Tabs defaultValue="decks" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="decks">My Decks</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="find">Find Deck</TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              <TabsContent value="decks">
                {loading ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-6 w-6 mr-2 animate-spin text-flashcard-primary" />
                    <p>Loading decks...</p>
                  </div>
                ) : (
                  <DeckGrid 
                    decks={Array.isArray(decks) ? decks : []} 
                    emptyMessage="You haven't created any decks yet. Click 'Create Deck' to get started."
                  />
                )}
              </TabsContent>
              
              <TabsContent value="favorites">
                {loading ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-6 w-6 mr-2 animate-spin text-flashcard-primary" />
                    <p>Loading favorites...</p>
                  </div>
                ) : (
                  <DeckGrid 
                    decks={favoritedDecks}
                    emptyMessage="You haven't favorited any decks yet."
                  />
                )}
              </TabsContent>
              
              <TabsContent value="find" className="flex justify-center pt-8">
                <div className="text-center space-y-4">
                  <h2 className="text-xl font-semibold">Find a Shared Deck</h2>
                  <p className="text-muted-foreground max-w-md">
                    Enter a deck code shared with you to access the flashcards.
                  </p>
                  <div className="flex justify-center pt-2">
                    <FindDeckForm />
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
