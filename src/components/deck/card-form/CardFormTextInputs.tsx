import React, { useState, useEffect } from 'react';
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

interface CardFormTextInputsProps {
  form: UseFormReturn<CardFormValues>;
  isSubmitting: boolean;
}

export const CardFormTextInputs = ({ form, isSubmitting }: CardFormTextInputsProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const url = form.getValues('question_image_url');
    if (url) {
      setPreviewUrl(url);
    }
  }, [form]);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2MB');
      return;
    }
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          if (img.width > 800 || img.height > 600) {
            toast.error('Image resolution must be at most 800x600px');
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
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('flashcard-images')
      .upload(fileName, file, { upsert: true });
    if (error) {
      toast.error('Failed to upload image');
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage
      .from('flashcard-images')
      .getPublicUrl(fileName);
    const publicUrl = urlData.publicUrl;
    form.setValue('question_image_url', publicUrl);
    setPreviewUrl(publicUrl);
    setUploading(false);
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

  return (
    <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} onPaste={handlePaste}>
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
              <div>
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
                />
                {uploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Question preview"
                    className="mt-2 max-w-full max-h-60 object-contain"
                  />
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
