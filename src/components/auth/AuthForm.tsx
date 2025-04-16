
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
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
    <div className="flex justify-center items-center w-full px-4">
      <Card className="w-full max-w-md overflow-hidden">
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: view === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: view === 'login' ? 20 : -20 }}
              transition={{ duration: 0.2 }}
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
