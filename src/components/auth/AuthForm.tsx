
import React, { useState } from 'react';
import LoginForm from './login/LoginForm';
import SignupForm from './signup/SignupForm';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';

interface AuthFormProps {
  onSuccess?: () => void;
  initialView?: 'login' | 'signup';
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess, initialView = 'login' }) => {
  const [view, setView] = useState<'login' | 'signup'>(initialView);

  const handleSwitch = () => {
    setView(prev => prev === 'login' ? 'signup' : 'login');
  };

  return (
    <div className="flex flex-col items-center justify-center w-full px-4 max-w-md mx-auto">
      {/* Logo with animation */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-6 w-full flex justify-center items-center"
      >
        <img 
          src="/lovable-uploads/7a10dc4d-9e61-45bc-ab71-4fd912895dc0.png" 
          alt="Aparie Logo" 
          className="w-32 h-32 object-contain animate-float"
        />
      </motion.div>
      
      <h2 className="text-2xl md:text-3xl font-bold text-flashcard-dark mb-2 text-center">
        Welcome to Aparie
      </h2>
      <p className="text-muted-foreground mb-8 text-center max-w-xs">
        Your journey to better learning starts here
      </p>
      
      <Card className="w-full overflow-hidden shadow-lg border-flashcard-secondary">
        <CardContent className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: view === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: view === 'login' ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              {view === 'login' ? (
                <LoginForm onSuccess={onSuccess} onSwitch={handleSwitch} />
              ) : (
                <SignupForm onSuccess={onSuccess} onSwitch={handleSwitch} />
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;
