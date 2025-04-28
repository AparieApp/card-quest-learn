
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const DISCORD_BOT_TOKEN = Deno.env.get('DISCORD_BOT_TOKEN');
const DISCORD_CHANNEL_ID = '1364877698077298688';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-secret',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Rate limiting implementation
const rateLimits: Record<string, { count: number, lastReset: number }> = {};

function checkRateLimit(identifier: string, maxRequests = 5, windowMs = 60000): boolean {
  const now = Date.now();
  if (!rateLimits[identifier]) {
    rateLimits[identifier] = { count: 1, lastReset: now };
    return true;
  }
  
  const limit = rateLimits[identifier];
  
  // Reset counter if window has passed
  if (now - limit.lastReset > windowMs) {
    limit.count = 1;
    limit.lastReset = now;
    return true;
  }
  
  // Increment counter and check
  limit.count++;
  return limit.count <= maxRequests;
}

// Input validation
function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Trim and limit length
  let sanitized = input.trim().slice(0, 5000);
  
  // Basic XSS protection
  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
    
  return sanitized;
}

// Check if string is valid UUID
function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get IP address for rate limiting
  const clientIp = req.headers.get('x-forwarded-for') || 
                   req.headers.get('cf-connecting-ip') || 
                   'unknown';
  
  try {
    const url = new URL(req.url);
    
    // Handle Discord webhook for replies
    if (url.pathname.startsWith('/webhook')) {
      // Rate limiting
      if (!checkRateLimit(`webhook-${clientIp}`, 10, 60000)) {
        return new Response(JSON.stringify({
          error: 'Too many requests, please try again later'
        }), { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }
      
      const secret = req.headers.get('x-secret');
      if (secret !== Deno.env.get('LOVABLE_SHARED_SECRET')) {
        return new Response('Unauthorized', { status: 401 });
      }

      const { threadId, author, content } = await req.json();
      
      // Input validation
      if (!threadId || typeof threadId !== 'string') {
        return new Response('Invalid thread ID', { status: 400 });
      }
      
      if (!author || typeof author !== 'string') {
        return new Response('Invalid author', { status: 400 });
      }
      
      if (!content || typeof content !== 'string') {
        return new Response('Invalid content', { status: 400 });
      }
      
      // Sanitize inputs
      const sanitizedAuthor = sanitizeInput(author);
      const sanitizedContent = sanitizeInput(content);
      
      // Get the feedback ID from thread ID
      const { data: feedback } = await supabase
        .from('feedback')
        .select('id')
        .eq('thread_id', threadId)
        .maybeSingle();

      if (!feedback) {
        return new Response('Feedback not found', { status: 404 });
      }

      // Store the reply
      await supabase
        .from('feedback_replies')
        .insert({
          feedback_id: feedback.id,
          author: sanitizedAuthor,
          content: sanitizedContent
        });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle new feedback submission
    // Rate limiting
    if (!checkRateLimit(`feedback-${clientIp}`, 5, 300000)) {
      return new Response(JSON.stringify({
        error: 'Too many feedback submissions, please try again later'
      }), { 
        status: 429, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    const { feedback, systemInfo } = await req.json();

    // Input validation
    if (!feedback || typeof feedback !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid feedback content' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!systemInfo || typeof systemInfo !== 'object') {
      return new Response(JSON.stringify({ error: 'Invalid system info' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Sanitize inputs
    const sanitizedFeedback = sanitizeInput(feedback);
    
    // Create a new thread in Discord
    const threadResponse = await fetch(`https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/threads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: sanitizedFeedback.substring(0, 50) + '...',
        type: 11, // Use 11 for public threads
        auto_archive_duration: 10080, // 7 days
      }),
    });

    if (!threadResponse.ok) {
      throw new Error(`Failed to create thread: ${threadResponse.status}`);
    }

    const thread = await threadResponse.json();

    // Store feedback in database
    const { data: storedFeedback, error: insertError } = await supabase
      .from('feedback')
      .insert({
        content: sanitizedFeedback,
        system_info: systemInfo,
        thread_id: thread.id
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Send the feedback message in the thread
    const messageContent = `**New Feedback**\n${sanitizedFeedback}\n\n**System Info**\n\`\`\`json\n${JSON.stringify(systemInfo, null, 2)}\n\`\`\``;

    const messageResponse = await fetch(`https://discord.com/api/v10/channels/${thread.id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: messageContent,
      }),
    });

    if (!messageResponse.ok) {
      throw new Error(`Failed to send message: ${messageResponse.status}`);
    }

    return new Response(JSON.stringify({ success: true, id: storedFeedback.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in feedback function:', error);
    return new Response(JSON.stringify({ error: 'An internal error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
