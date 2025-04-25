import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import Layout from '@/components/layout/Layout';
import { BookOpen, Brain, Share2, Award } from 'lucide-react';
const Index = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated
  } = useAuth();
  return <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-flashcard-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Master Any Subject with <span className="text-flashcard-primary">Aparie</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Create, practice, and share digital flashcards to improve your learning and memory retention.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="bg-flashcard-primary hover:bg-flashcard-secondary" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}>
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
            </Button>
            {!isAuthenticated && <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
                Log In
              </Button>}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-flashcard-primary/10 rounded-full mb-4">
                <BookOpen className="w-8 h-8 text-flashcard-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Decks</h3>
              <p className="text-muted-foreground">
                Easily create custom flashcard decks for any subject you're learning.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-flashcard-primary/10 rounded-full mb-4">
                <Brain className="w-8 h-8 text-flashcard-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Practice & Test</h3>
              <p className="text-muted-foreground">
                Multiple study modes help you memorize and test your knowledge.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-flashcard-primary/10 rounded-full mb-4">
                <Share2 className="w-8 h-8 text-flashcard-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Share Decks</h3>
              <p className="text-muted-foreground">
                Share your decks with friends via links, codes, or QR codes.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-flashcard-primary/10 rounded-full mb-4">
                <Award className="w-8 h-8 text-flashcard-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-muted-foreground">
                See your improvement with detailed performance statistics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-flashcard-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Learning?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Join thousands of students improving their knowledge with flashcards.
          </p>
          <Button size="lg" className="bg-flashcard-primary hover:bg-flashcard-secondary" onClick={() => navigate('/auth')}>
            Create Your First Deck
          </Button>
        </div>
      </section>
    </Layout>;
};
export default Index;