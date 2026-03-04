import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getEffectiveChurchId } from '@/lib/api-helpers';
import { generateAIResponse, AI_SYSTEM_PROMPTS } from '@/lib/ai-client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { churchId, error } = await getEffectiveChurchId(request);
    if (error || !churchId) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    // Check if church is on a Blue tier
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      select: {
        name: true,
        subscriptionTier: true,
      },
    });

    if (!church) {
      return NextResponse.json({ error: 'Church not found' }, { status: 404 });
    }

    if (church.subscriptionTier !== 'blue_shared' && church.subscriptionTier !== 'blue_dedicated') {
      return NextResponse.json(
        { error: 'AI Message Writer is available on Blue plans only' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { prompt, occasion, groupName } = body || {};

    if (!prompt && !occasion) {
      return NextResponse.json(
        { error: 'Please provide a prompt or occasion' },
        { status: 400 }
      );
    }

    // Gather church context
    const [recentMessages, contacts, groups] = await Promise.all([
      prisma.message.findMany({
        where: { churchId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { body: true },
      }),
      prisma.contact.count({ where: { churchId } }),
      prisma.group.findMany({
        where: { churchId },
        select: { name: true },
      }),
    ]);

    const systemPrompt = AI_SYSTEM_PROMPTS.messageWriter({
      churchName: church.name,
      recentMessages: recentMessages.map((m) => m.body),
      contactCount: contacts,
      groups: groups.map((g) => g.name),
    });

    let userPrompt = '';
    if (occasion) {
      userPrompt = `Write a text message for: ${occasion}`;
      if (groupName) userPrompt += ` (sending to group: ${groupName})`;
    } else {
      userPrompt = prompt;
    }

    const result = await generateAIResponse(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { maxTokens: 512, temperature: 0.8 }
    );

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ message: result.content.trim() });
  } catch (error: any) {
    console.error('AI compose error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
