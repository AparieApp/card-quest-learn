import React, { useState, useEffect, useCallback } from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { CardFormValues } from './types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth';
import { Loader2 } from 'lucide-react';

interface CardFormTextInputsProps {
  form: UseFormReturn<CardFormValues>;
  isSubmitting: boolean;
}

export const CardFormTextInputs = ({ form, isSubmitting }: CardFormTextInputsProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const url = form.getValues('question_image_url');
    if (url) {
      setPreviewUrl(url);
    }
  }, [form]);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }
    
    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2MB');
      return;
    }

    // Check authentication
    if (!isAuthenticated) {
      toast.error('You must be logged in to upload images');
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          if (img.width > 1280 || img.height > 960) {
            toast.error('Image resolution must be at most 1280x960px');
            reject();
          } else {
            resolve();
          }
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          toast.error('Error loading image for validation');
          reject();
        };
      });
    } catch {
      return;
    }
    
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      console.log('Uploading file to storage bucket: flashcard-images');
      console.log('File details:', { name: fileName, type: file.type, size: file.size });
      
      const { data, error } = await supabase.storage
        .from('flashcard-images')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type 
        });
        
      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }
      
      const { data: urlData } = supabase.storage
        .from('flashcard-images')
        .getPublicUrl(fileName);
        
      const publicUrl = urlData.publicUrl;
      console.log('Upload successful, public URL:', publicUrl);
      
      form.setValue('question_image_url', publicUrl);
      setPreviewUrl(publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] || null;
    handleFile(file);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    if (!items) return;
    for (let item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        handleFile(file);
        break;
      }
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    form.setValue('question_image_url', '');
    toast.info('Image removed');
  };

  return (
    <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} onPaste={handlePaste} className="space-y-6">
      <FormField
        control={form.control}
        name="front_text"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Question Text</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter the question or front side text"
                className="min-h-20"
                {...field}
                disabled={isSubmitting || uploading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="question_image_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Upload Question Image</FormLabel>
            <FormControl>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  ref={field.ref}
                  onChange={(e) => {
                    handleFileChange(e);
                  }}
                  onBlur={field.onBlur}
                  disabled={isSubmitting || uploading || field.disabled}
                  name={field.name}
                  className="cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 h-9 flex items-center text-xs"
                />
                {uploading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading image...</span>
                  </div>
                )}
                {previewUrl && (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Question preview"
                      className="mt-2 max-w-full max-h-60 object-contain border rounded-md"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label="Remove image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="correct_answer"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Correct Answer</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter the correct answer"
                {...field}
                disabled={isSubmitting || uploading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
