
import React, { ReactNode } from 'react';
import Header from './Header';
import { FeedbackButton } from '../feedback/FeedbackButton';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showHeader = true }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header />}
      <main className="flex-grow flex flex-col">
        {children}
      </main>
      <FeedbackButton />
    </div>
  );
};

export default Layout;
