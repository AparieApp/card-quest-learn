
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const DISCORD_BOT_TOKEN = Deno.env.get('DISCORD_BOT_TOKEN');
const DISCORD_CHANNEL_ID = '1364877698077298688';
const DISCORD_SERVER_ID = '1364877553353097239';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { feedback, systemInfo } = await req.json();

    // Create a new thread in the feedback channel
    const threadResponse = await fetch(`https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/threads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: feedback.substring(0, 50) + '...', // Use first 50 chars of feedback as thread name
        type: 11, // Public thread
        auto_archive_duration: 10080, // 7 days
      }),
    });

    if (!threadResponse.ok) {
      throw new Error(`Failed to create thread: ${threadResponse.status}`);
    }

    const thread = await threadResponse.json();

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

    return new Response(JSON.stringify({ success: true, threadId: thread.id }), {
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
