
import React, { ReactNode, useEffect } from 'react';
import Header from './Header';
import { FeedbackButton } from '../feedback/FeedbackButton';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showHeader = true }) => {
  const isMobile = useIsMobile();
  
  // Add effect to ensure proper safe area handling and iOS-specific behaviors
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Set the viewport height to handle iOS Safari issues
      const setVh = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };
      
      // Fix for iOS viewport height changes on scroll/orientation
      setVh();
      window.addEventListener('resize', setVh);
      
      // Add iOS-specific class to help with styling
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS) {
        document.documentElement.classList.add('ios-device');
      }
      
      return () => {
        window.removeEventListener('resize', setVh);
      };
    }
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Add safe-top class to the header for iOS notch spacing */}
      {showHeader && <Header />}
      
      {/* Main content with safe area classes */}
      <main className="flex-grow flex flex-col safe-left safe-right">
        {children}
      </main>
      
      {/* Position the feedback button appropriately for mobile */}
      <div className={`${isMobile ? 'fixed bottom-4 right-4 z-10' : ''}`}>
        <FeedbackButton />
      </div>
      
      {/* Add safe area at the bottom for mobile devices */}
      {isMobile && <div className="h-16 safe-bottom" />}
    </div>
  );
};

export default Layout;
