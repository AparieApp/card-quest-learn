
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCreateDeck } from '@/hooks/deck/useCreateDeck';
import { useAuth } from '@/context/auth';

const createDeckSchema = z.object({
  title: z.string().min(1, 'Title is required').max(50, 'Title must be 50 characters or less'),
  description: z.string().max(200, 'Description must be 200 characters or less').optional(),
});

type CreateDeckFormValues = z.infer<typeof createDeckSchema>;

const CreateDeckButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { handleCreateDeck, isCreating } = useCreateDeck();
  const { isAuthenticated } = useAuth();

  const form = useForm<CreateDeckFormValues>({
    resolver: zodResolver(createDeckSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const onSubmit = async (values: CreateDeckFormValues) => {
    const newDeck = await handleCreateDeck(values);
    if (newDeck) {
      setOpen(false);
      form.reset();
      navigate(`/deck/${newDeck.id}`);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-flashcard-primary hover:bg-flashcard-secondary">
          <Plus className="mr-2 h-4 w-4" /> Create Deck
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Deck</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Deck title" 
                      {...field} 
                      disabled={isCreating}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A short description of this deck"
                      {...field}
                      rows={3}
                      disabled={isCreating}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isCreating}
                className="bg-flashcard-primary hover:bg-flashcard-secondary"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Deck
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDeckButton;
