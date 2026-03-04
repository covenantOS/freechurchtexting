// OpenRouter AI Client — Qwen 3.5 Flash
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'qwen/qwen3.5-coder-flash';

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
  options?: { maxTokens?: number; temperature?: number }
): Promise<AIResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { content: '', error: 'OpenRouter API key not configured' };
  }

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
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { content: '', error: err?.error?.message || `API error: ${response.status}` };
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';
    return { content };
  } catch (error: any) {
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
  }) => `You are an AI message writer for "${churchContext.churchName}", a church using Free Church Texting to communicate with their congregation.

Your job is to write SMS text messages for the church. Keep messages:
- Short and warm (SMS has 160 char segments, aim for 1-2 segments)
- In the church's voice (friendly, welcoming, faith-oriented)
- Include relevant merge tags like {first_name} when personal
- Include STOP/HELP language when appropriate for blasts
- Never use emojis unless the church's recent messages use them

${churchContext.recentMessages?.length ? `Here are some recent messages from this church to match their tone:\n${churchContext.recentMessages.slice(0, 5).map(m => `- "${m}"`).join('\n')}` : ''}
${churchContext.groups?.length ? `Groups in this church: ${churchContext.groups.join(', ')}` : ''}
${churchContext.contactCount ? `This church has ${churchContext.contactCount} contacts.` : ''}

When asked to write a message, output ONLY the message text — no explanations, no quotes, no formatting. Just the raw SMS text.`,

  contextualHelp: `You are a helpful assistant for Free Church Texting, a SMS platform for churches.
Provide brief, actionable help about:
- Sending messages (individual, blast, scheduled)
- Managing contacts (import, opt-in status, groups)
- A2P compliance and registration
- Provider setup (Twilio/Telnyx)
- Templates and spintax
- Subscription tiers (Free, Blue Shared, Blue Dedicated)

Keep responses under 3 sentences. Be direct and practical.`,
};
