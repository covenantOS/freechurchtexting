import { NextRequest, NextResponse } from 'next/server';
import { getEffectiveChurchId } from '@/lib/api-helpers';
import { generateAIResponse, AI_SYSTEM_PROMPTS } from '@/lib/ai-client';

export const dynamic = 'force-dynamic';
export const maxDuration = 15;

export async function POST(request: NextRequest) {
  try {
    const { churchId, error } = await getEffectiveChurchId(request);
    if (error || !churchId) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { question, context, activeTab, selectedGroup, recipientType, sendingMode, selectedContactName } = body || {};

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    let contextParts: string[] = [];
    if (context) contextParts.push(`User is on the '${context}' page`);
    if (activeTab) contextParts.push(`active tab: '${activeTab}'`);
    if (selectedGroup) contextParts.push(`selected group: '${selectedGroup}'`);
    if (recipientType) contextParts.push(`recipient type is set to '${recipientType}'`);
    if (sendingMode) contextParts.push(`sending mode is '${sendingMode}'`);
    if (selectedContactName) contextParts.push(`selected contact: '${selectedContactName}'`);

    const userMessage = contextParts.length > 0
      ? `Context: ${contextParts.join(', ')}.\n\nQuestion: ${question}`
      : question;

    const result = await generateAIResponse(
      [
        { role: 'system', content: AI_SYSTEM_PROMPTS.contextualHelp },
        { role: 'user', content: userMessage },
      ],
      { maxTokens: 256, temperature: 0.5 }
    );

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ answer: result.content.trim() });
  } catch (error: any) {
    console.error('AI help error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
