import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { encrypt } from '@/lib/encryption';
import { formatE164 } from '@/lib/phone';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updateData: any = {};

    // Basic fields
    if (body?.leaderName !== undefined) updateData.leaderName = body.leaderName;
    if (body?.phone !== undefined) updateData.phone = body.phone;
    if (body?.address !== undefined) updateData.address = body.address;
    if (body?.city !== undefined) updateData.city = body.city;
    if (body?.state !== undefined) updateData.state = body.state;
    if (body?.zip !== undefined) updateData.zip = body.zip;
    if (body?.website !== undefined) updateData.website = body.website;
    if (body?.ein !== undefined) updateData.ein = body.ein;
    if (body?.name !== undefined) updateData.name = body.name;
    if (body?.timezone !== undefined) updateData.timezone = body.timezone;
    if (body?.provider !== undefined) updateData.provider = body.provider;

    // Encrypted provider fields
    if (body?.providerAccountSid !== undefined) {
      updateData.providerAccountSid = encrypt(body.providerAccountSid);
    }
    if (body?.providerAuthToken !== undefined) {
      updateData.providerAuthToken = encrypt(body.providerAuthToken);
    }
    if (body?.providerPhoneNumber !== undefined) {
      updateData.providerPhoneNumber = formatE164(body.providerPhoneNumber);
    }
    if (body?.providerMessagingServiceSid !== undefined) {
      updateData.providerMessagingServiceSid = body.providerMessagingServiceSid;
    }

    const church = await prisma.church.update({
      where: { id: session.user.churchId },
      data: updateData,
    });

    return NextResponse.json({ success: true, church });
  } catch (error: any) {
    console.error('Church update error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
