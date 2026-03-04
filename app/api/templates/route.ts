import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getEffectiveChurchId } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { churchId, error } = await getEffectiveChurchId(request);
    if (error || !churchId) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const templates = await prisma.template.findMany({
      where: { churchId },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error('Get templates error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { churchId, error } = await getEffectiveChurchId(request);
    if (error || !churchId) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, body: templateBody, category } = body || {};

    if (!name || !templateBody) {
      return NextResponse.json({ error: 'Name and body are required' }, { status: 400 });
    }

    const template = await prisma.template.create({
      data: {
        churchId,
        name,
        body: templateBody,
        category: category || 'general',
      },
    });

    return NextResponse.json({ template });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'A template with this name already exists' },
        { status: 400 }
      );
    }
    console.error('Create template error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
