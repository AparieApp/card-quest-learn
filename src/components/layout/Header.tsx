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
        <Button 
          variant="ghost" 
          size="sm" 
          className="md:hidden btn-mobile-optimized hover:bg-flashcard-primary/10"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="py-8 safe-area-full w-80 sm:w-72">
        <div className="flex flex-col gap-6 h-full">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/aparie-logo.png" 
              alt="Aparie Logo" 
              className="w-12 h-12 object-contain" 
            />
            <h1 className="ml-2 text-xl font-bold text-flashcard-primary">Aparie</h1>
          </div>
          
          <div className="flex flex-col gap-3 flex-1">
            <Button 
              variant="ghost" 
              className="w-full justify-start btn-mobile-optimized hover:bg-flashcard-primary/10" 
              onClick={() => {
                navigate('/');
                setSheetOpen(false);
              }}
            >
              <Home className="mr-3 h-4 w-4" />
              Home
            </Button>
            
            {isAuthenticated && (
              <Button 
                variant="ghost" 
                className="w-full justify-start btn-mobile-optimized hover:bg-flashcard-primary/10" 
                onClick={() => {
                  navigate('/dashboard');
                  setSheetOpen(false);
                }}
              >
                <BookOpen className="mr-3 h-4 w-4" />
                Dashboard
              </Button>
            )}
          </div>
          
          {isAuthenticated && (
            <div className="px-4 py-3 border-t border-border bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-1 text-muted-foreground">Signed in as:</p>
              <p className="text-base font-bold truncate">{user?.username}</p>
            </div>
          )}
          
          <div className="mt-auto pt-4">
            {isAuthenticated ? (
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-500 hover:bg-red-50 btn-mobile-optimized" 
                onClick={() => {
                  handleLogout();
                  setSheetOpen(false);
                }}
              >
                <LogOut className="mr-3 h-4 w-4" />
                Log out
              </Button>
            ) : (
              <Button 
                className="w-full bg-flashcard-primary hover:bg-flashcard-primary/90 btn-mobile-optimized"
                onClick={() => {
                  navigate('/auth');
                  setSheetOpen(false);
                }}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2 min-w-0">
          {isMobile && <MobileNavigation />}
          
          <div 
            onClick={() => navigate('/')}
            className="flex items-center cursor-pointer min-w-0 flex-shrink-0"
          >
            <img 
              src="/aparie-logo.png" 
              alt="Aparie Logo" 
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain mr-2 flex-shrink-0" 
            />
            <h1 className="text-lg sm:text-xl font-bold text-flashcard-primary truncate">
              Aparie
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative h-9 w-9 rounded-full btn-mobile-optimized hover:bg-flashcard-primary/10"
                >
                  <User className="h-5 w-5 text-flashcard-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mr-4">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="font-normal text-xs text-muted-foreground">Signed in as</span>
                  <span className="font-medium truncate">{user?.username}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => navigate('/dashboard')}
                  className="cursor-pointer"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="text-red-500 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={() => navigate('/auth')} 
              variant="default" 
              className="bg-flashcard-primary hover:bg-flashcard-primary/90 btn-responsive-padding text-sm sm:text-base"
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
