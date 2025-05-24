import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { FeedbackDialog } from "./FeedbackDialog";
import { useIsMobile } from '@/hooks/use-mobile';

export function FeedbackButton() {
  const [isOpen, setIsOpen] = React.useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={`
          shadow-lg z-50 btn-mobile-optimized
          ${isMobile 
            ? 'fixed bottom-safe right-safe bottom-4 right-4' 
            : 'fixed bottom-6 right-6'
          }
          bg-flashcard-primary hover:bg-flashcard-primary/90
          border-2 border-white
          transition-all duration-200 ease-in-out
          hover:scale-105 active:scale-95
          button-touch
        `}
        style={isMobile ? {
          bottom: `calc(1rem + env(safe-area-inset-bottom))`,
          right: `calc(1rem + env(safe-area-inset-right))`
        } : {}}
        size={isMobile ? "default" : "lg"}
      >
        <MessageCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
        <span className="text-sm sm:text-base">Feedback</span>
      </Button>
      <FeedbackDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
