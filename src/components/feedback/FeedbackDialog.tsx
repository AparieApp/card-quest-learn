
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';

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

  const { data: replies = [], isLoading: isLoadingReplies } = useQuery({
    queryKey: ['feedback-replies', feedbackId],
    queryFn: async () => {
      if (!feedbackId) return [];
      const { data, error } = await supabase
        .from('feedback_replies')
        .select('*')
        .eq('feedback_id', feedbackId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as FeedbackReply[];
    },
    enabled: !!feedbackId,
  });

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
          
          <div className="py-4">
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

          {(replies.length > 0 || isLoadingReplies) && (
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-medium">Responses</h3>
              {isLoadingReplies ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {replies.map((reply) => (
                    <div key={reply.id} className="rounded-lg bg-muted p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{reply.author}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(reply.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Close
            </Button>
            <Button type="submit" disabled={isSubmitting || !feedback.trim()}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Feedback
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
