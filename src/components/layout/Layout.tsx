
import React, { ReactNode } from 'react';
import Header from './Header';
import { FeedbackButton } from '../feedback/FeedbackButton';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showHeader = true }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header />}
      <main className="flex-grow flex flex-col">
        {children}
      </main>
      {/* Position the feedback button appropriately for mobile */}
      <div className={`${isMobile ? 'fixed bottom-4 right-4' : ''}`}>
        <FeedbackButton />
      </div>
      
      {/* Add a safe area at the bottom for mobile devices to prevent content from being hidden behind system UI */}
      {isMobile && <div className="h-16" />}
    </div>
  );
};

export default Layout;
