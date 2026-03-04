// OpenRouter AI Client — Qwen 3.5 Flash
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'qwen/qwen3.5-flash-02-23';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  content: string;
  error?: string;
}

export async function generateAIResponse(
  messages: ChatMessage[],
  options?: { maxTokens?: number; temperature?: number; signal?: AbortSignal }
): Promise<AIResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { content: '', error: 'OpenRouter API key not configured' };
  }

  // Use provided signal or default to 15-second timeout
  const fetchSignal = options?.signal ?? AbortSignal.timeout(15000);

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://freechurchtexting.com',
        'X-Title': 'Free Church Texting',
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: options?.maxTokens || 1024,
        temperature: options?.temperature ?? 0.7,
      }),
      signal: fetchSignal,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { content: '', error: err?.error?.message || `API error: ${response.status}` };
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';
    return { content };
  } catch (error: any) {
    if (error?.name === 'AbortError' || error?.name === 'TimeoutError') {
      return { content: '', error: 'AI response timed out. Please try again with a simpler question.' };
    }
    return { content: '', error: error?.message || 'Failed to generate AI response' };
  }
}

// System prompts for different AI features
export const AI_SYSTEM_PROMPTS = {
  messageWriter: (churchContext: {
    churchName: string;
    recentMessages?: string[];
    contactCount?: number;
    groups?: string[];
    provider?: 'twilio' | 'telnyx' | 'imessage' | string;
    recipientType?: 'individual' | 'group' | 'all';
    recipientCount?: number;
    subscriptionTier?: string;
  }) => {
    const isIMessage = churchContext.provider === 'imessage' ||
      churchContext.subscriptionTier === 'blue_shared' ||
      churchContext.subscriptionTier === 'blue_dedicated';
    const isBlast = churchContext.recipientType === 'group' || churchContext.recipientType === 'all';

    const complianceLine = isIMessage
      ? '- Do NOT include STOP/HELP opt-out language (iMessage does not require it)'
      : isBlast
        ? '- Include STOP/HELP opt-out language at the end for blast messages (required for SMS compliance)'
        : '- Do NOT include STOP/HELP language for individual messages';

    const recipientLine = churchContext.recipientType === 'individual'
      ? '- This is a personal message to one person. Use {first_name} and keep it conversational.'
      : churchContext.recipientType === 'group'
        ? `- This is a group blast to ${churchContext.recipientCount || 'multiple'} people. Use {first_name} for personalization.`
        : `- This is a blast to all ${churchContext.recipientCount || ''} opted-in contacts. Use {first_name} for personalization.`;

    return `You are an AI message writer for "${churchContext.churchName}", a church using Free Church Texting to communicate with their congregation.

Your job is to write ${isIMessage ? 'iMessage/RCS' : 'SMS'} text messages for the church. Keep messages:
- Short and warm (aim for 1-2 segments / under 320 characters)
- In the church's voice (friendly, welcoming, faith-oriented)
- Include relevant merge tags like {first_name} when personal
${complianceLine}
- Never use emojis unless the church's recent messages use them
${recipientLine}

${churchContext.recentMessages?.length ? `Here are some recent messages from this church to match their tone:\n${churchContext.recentMessages.slice(0, 5).map(m => `- "${m}"`).join('\n')}` : ''}
${churchContext.groups?.length ? `Groups in this church: ${churchContext.groups.join(', ')}` : ''}
${churchContext.contactCount ? `This church has ${churchContext.contactCount} contacts.` : ''}

When asked to write a message, output ONLY the message text — no explanations, no quotes, no formatting. Just the raw message text.`;
  },

  contextualHelp: `You are a smart helper for Free Church Texting, a SMS platform for churches.

You will receive context about which page the user is on and what they can do there.

Page Guide:
- Dashboard: Shows stats (contacts, messages, delivery rate). Quick actions: Send a Text, Add Contacts.
- Messages: Compose and send messages. Has tabs: Compose, Scheduled, History. Compose has: recipient selector (Individual/Group/All), message body with merge tags, templates, sending modes, scheduling.
- Contacts: View/add/import contacts. Search, filter by group, bulk actions. Import via CSV.
- Groups: Create and manage contact groups. Assign contacts to groups.
- Templates: Create reusable message templates with merge tags and spintax.
- Conversations: Two-way message inbox. See inbound messages, reply to contacts.
- Settings: Provider setup (Twilio/Telnyx), church info, team management, A2P registration, auto-replies (Blue Dedicated).
- Admin Panel: (Super admins only) View all churches, impersonate users.

When answering:
1. Consider what page the user is currently on
2. Give specific, actionable guidance referencing UI elements by name
3. If they need to be on a different page, tell them which page to navigate to
4. Keep responses under 3 sentences
5. If suggesting navigation, include the page name in brackets like [Messages] or [Contacts]

Example: If user asks "How do I send to a group?" and they're on the Messages page, say: "In the compose area, click the 'Group' tab in the recipient selector, then choose your group from the dropdown. Type your message and click Send."

Example: If user asks "How do I send to a group?" and they're on the Contacts page, say: "Navigate to the [Messages] page first, then click the 'Group' tab in the recipient selector to choose your group."
`,
};
