
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';
import { ScrollArea } from "@/components/ui/scroll-area";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FeedbackReply {
  id: string;
  author: string;
  content: string;
  created_at: string;
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const [feedback, setFeedback] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedbackId, setFeedbackId] = React.useState<string | null>(null);
  const charLimit = 2000;
  const messageEndRef = React.useRef<HTMLDivElement>(null);

  const { data: replies = [], isLoading: isLoadingReplies } = useQuery({
    queryKey: ['feedback-replies', feedbackId],
    queryFn: async () => {
      if (!feedbackId) return [];
      
      const supabaseUrl = "https://khtlezzcdjahvqaflgvk.supabase.co";
      const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtodGxlenpjZGphaHZxYWZsZ3ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3OTQ2MjcsImV4cCI6MjA2MDM3MDYyN30.4UqMdojyZxfHf8aiEz82W9z0kdbv5YCcIY4TCamyPvY";
      
      const { data, error } = await fetch(`${supabaseUrl}/rest/v1/feedback_replies?feedback_id=eq.${feedbackId}&order=created_at.asc`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        }
      }).then(res => res.json())
        .then(data => ({ data, error: null }))
        .catch(error => ({ data: null, error }));

      if (error) throw error;
      return data as FeedbackReply[];
    },
    enabled: !!feedbackId,
    refetchInterval: open ? 5000 : false, // Poll every 5 seconds when dialog is open
  });

  React.useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [replies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    try {
      const systemInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      };

      const { data, error } = await supabase.functions.invoke('feedback', {
        body: { feedback: feedback.trim(), systemInfo },
      });

      if (error) throw error;
      
      setFeedbackId(data.id);
      setFeedback("");
      toast.success("Thank you for your feedback! We'll get back to you soon.");
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Send Feedback</DialogTitle>
            <DialogDescription>
              Help us improve! Share your thoughts, suggestions, or report issues.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            {(replies.length > 0 || isLoadingReplies) && (
              <ScrollArea className="h-[200px] rounded-md border p-4">
                {isLoadingReplies ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-sm">{feedback}</p>
                    </div>
                    {replies.map((reply) => (
                      <div key={reply.id} className="rounded-lg bg-accent p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">{reply.author}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(reply.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{reply.content}</p>
                      </div>
                    ))}
                    <div ref={messageEndRef} />
                  </div>
                )}
              </ScrollArea>
            )}

            {!feedbackId && (
              <div>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Your feedback here..."
                  className="min-h-[100px]"
                  maxLength={charLimit}
                />
                <div className="text-sm text-muted-foreground text-right mt-1">
                  {feedback.length}/{charLimit}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Close
            </Button>
            {!feedbackId && (
              <Button type="submit" disabled={isSubmitting || !feedback.trim()}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Feedback
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
