
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // Handle Discord webhook for replies
    if (url.pathname.startsWith('/webhook')) {
      const secret = req.headers.get('x-secret');
      if (secret !== Deno.env.get('LOVABLE_SHARED_SECRET')) {
        return new Response('Unauthorized', { status: 401 });
      }

      const { threadId, author, content } = await req.json();
      
      // Get the feedback ID from thread ID
      const { data: feedback } = await supabase
        .from('feedback')
        .select('id')
        .eq('thread_id', threadId)
        .single();

      if (!feedback) {
        return new Response('Feedback not found', { status: 404 });
      }

      // Store the reply
      await supabase
        .from('feedback_replies')
        .insert({
          feedback_id: feedback.id,
          author,
          content
        });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle new feedback submission
    const { feedback, systemInfo } = await req.json();

    // Create a new thread in Discord
    const threadResponse = await fetch(`https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/threads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: feedback.substring(0, 50) + '...',
        type: 11,
        auto_archive_duration: 10080,
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
        content: feedback,
        system_info: systemInfo,
        thread_id: thread.id
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Send the feedback message in the thread
    const messageContent = `**New Feedback**\n${feedback}\n\n**System Info**\n\`\`\`json\n${JSON.stringify(systemInfo, null, 2)}\n\`\`\``;

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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
