import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, User, LogOut, Home, BookOpen } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);
  
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Mobile navigation using Sheet
  const MobileNavigation = () => (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="py-8 safe-top safe-left">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/aparie-logo.png" 
              alt="Aparie Logo" 
              className="w-12 h-12 object-contain" 
            />
            <h1 className="ml-2 text-xl font-bold text-flashcard-primary">Aparie</h1>
          </div>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            onClick={() => {
              navigate('/');
              setSheetOpen(false);
            }}
          >
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            onClick={() => {
              navigate('/dashboard');
              setSheetOpen(false);
            }}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          
          {isAuthenticated ? (
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-500" 
              onClick={() => {
                handleLogout();
                setSheetOpen(false);
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          ) : (
            <Button 
              className="w-full bg-flashcard-primary hover:bg-flashcard-primary/90"
              onClick={() => {
                navigate('/auth');
                setSheetOpen(false);
              }}
            >
              Login
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-top">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          {isMobile && <MobileNavigation />}
          
          <div 
            onClick={() => navigate('/')}
            className="flex items-center cursor-pointer"
          >
            <img 
              src="/aparie-logo.png" 
              alt="Aparie Logo" 
              className="w-9 h-9 object-contain mr-2" 
            />
            <h1 className="text-xl font-bold text-flashcard-primary">Aparie</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-full">
                  <User className="h-5 w-5 text-flashcard-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {user?.username}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={() => navigate('/auth')} 
              variant="default" 
              className="bg-flashcard-primary hover:bg-flashcard-primary/90"
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
