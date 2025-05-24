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
      window.addEventListener('orientationchange', setVh);
      
      // Add device-specific classes to help with styling
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      const isMobileDevice = window.innerWidth < 768 || 'ontouchstart' in window;
      
      if (isIOS) {
        document.documentElement.classList.add('ios-device');
      }
      
      if (isMobileDevice) {
        document.documentElement.classList.add('mobile-device');
      }
      
      // Add viewport meta tag for better mobile experience if not present
      let viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        viewportMeta.setAttribute('name', 'viewport');
        document.head.appendChild(viewportMeta);
      }
      viewportMeta.setAttribute(
        'content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      );
      
      return () => {
        window.removeEventListener('resize', setVh);
        window.removeEventListener('orientationchange', setVh);
      };
    }
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-background safe-area-full">
      {/* Header with safe area handling */}
      {showHeader && (
        <div className="sticky top-0 z-40 safe-top">
          <Header />
        </div>
      )}
      
      {/* Main content with proper safe area and responsive padding */}
      <main className={`
        flex-grow flex flex-col
        safe-left safe-right
        ${isMobile ? 'content-mobile-height' : 'min-h-[calc(100vh-4rem)]'}
      `}>
        {children}
      </main>
      
      {/* Feedback button with improved positioning */}
      <FeedbackButton />
      
      {/* Safe area spacer for mobile devices */}
      {isMobile && (
        <div className="safe-bottom" style={{ minHeight: 'env(safe-area-inset-bottom)' }} />
      )}
    </div>
  );
};

export default Layout;
