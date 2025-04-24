
import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { FeedbackDialog } from "./FeedbackDialog";

export function FeedbackButton() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 shadow-lg z-50"
        size="lg"
      >
        <MessageCircle className="mr-2 h-5 w-5" />
        Feedback
      </Button>
      <FeedbackDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
