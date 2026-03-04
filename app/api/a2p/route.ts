import { NextRequest, NextResponse } from 'next/server';
import { getEffectiveChurchId } from '@/lib/api-helpers';
import { prisma } from '@/lib/db';
import { decrypt } from '@/lib/encryption';

export const dynamic = 'force-dynamic';

/**
 * GET /api/a2p — Returns current A2P status for the church
 */
export async function GET(request: NextRequest) {
  try {
    const { churchId, error } = await getEffectiveChurchId(request);
    if (error || !churchId) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const church = await prisma.church.findUnique({
      where: { id: churchId },
      select: {
        a2pStatus: true,
        name: true,
        provider: true,
        subscriptionTier: true,
      },
    });

    if (!church) {
      return NextResponse.json({ error: 'Church not found' }, { status: 404 });
    }

    return NextResponse.json({
      a2pStatus: church.a2pStatus,
      churchName: church.name,
      provider: church.provider,
      subscriptionTier: church.subscriptionTier,
    });
  } catch (error: any) {
    console.error('Get A2P status error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/a2p — Submit brand registration to Twilio A2P Trust Hub
 */
export async function POST(request: NextRequest) {
  try {
    const { churchId, error } = await getEffectiveChurchId(request);
    if (error || !churchId) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const church = await prisma.church.findUnique({
      where: { id: churchId },
    });

    if (!church) {
      return NextResponse.json({ error: 'Church not found' }, { status: 404 });
    }

    if (church.provider !== 'twilio') {
      return NextResponse.json(
        { error: 'A2P registration is only available for Twilio. Telnyx handles registration separately.' },
        { status: 400 }
      );
    }

    if (!church.providerAccountSid || !church.providerAuthToken) {
      return NextResponse.json(
        { error: 'Twilio credentials not configured. Please set up your Twilio account first.' },
        { status: 400 }
      );
    }

    // Decrypt credentials
    const accountSid = decrypt(church.providerAccountSid);
    const authToken = decrypt(church.providerAuthToken);

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Failed to decrypt Twilio credentials' },
        { status: 500 }
      );
    }

    const twilioAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const twilioHeaders = {
      'Authorization': `Basic ${twilioAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    // Step 1: Create a Customer Profile Bundle
    const bundleParams = new URLSearchParams({
      FriendlyName: `${church.name} - A2P Brand`,
      Email: church.email,
      PolicySid: 'RN806dd6cd175f314e1f96a9727ee271f4', // Twilio A2P Starter Profile policy
      StatusCallback: '',
    });

    const bundleRes = await fetch(
      `https://trusthub.twilio.com/v1/CustomerProfiles`,
      { method: 'POST', headers: twilioHeaders, body: bundleParams.toString() }
    );
    const bundleData = await bundleRes.json();

    if (!bundleRes.ok) {
      console.error('Twilio bundle creation failed:', bundleData);
      return NextResponse.json(
        { error: bundleData?.message || 'Failed to create customer profile bundle' },
        { status: 400 }
      );
    }

    const bundleSid = bundleData?.sid;

    // Step 2: Create End User with business information
    const endUserParams = new URLSearchParams({
      FriendlyName: church.name,
      Type: 'us_a2p_messaging_profile_information',
      'Attributes': JSON.stringify({
        business_name: church.name,
        business_type: 'Non-profit Corporation',
        business_registration_identifier: church.ein || '',
        business_identity: 'direct_customer',
        business_industry: 'RELIGIOUS',
        business_regions_of_operation: 'USA_AND_CANADA',
        website_url: church.website || '',
        social_media_profile_urls: '',
        business_registration_number: church.ein || '',
      }),
    });

    const endUserRes = await fetch(
      `https://trusthub.twilio.com/v1/EndUsers`,
      { method: 'POST', headers: twilioHeaders, body: endUserParams.toString() }
    );
    const endUserData = await endUserRes.json();

    if (!endUserRes.ok) {
      console.error('Twilio end user creation failed:', endUserData);
      return NextResponse.json(
        { error: endUserData?.message || 'Failed to create end user profile' },
        { status: 400 }
      );
    }

    // Step 3: Assign End User to the Bundle
    const assignParams = new URLSearchParams({
      ObjectSid: endUserData?.sid,
    });

    const assignRes = await fetch(
      `https://trusthub.twilio.com/v1/CustomerProfiles/${bundleSid}/EntityAssignments`,
      { method: 'POST', headers: twilioHeaders, body: assignParams.toString() }
    );

    if (!assignRes.ok) {
      const assignData = await assignRes.json();
      console.error('Twilio entity assignment failed:', assignData);
      return NextResponse.json(
        { error: assignData?.message || 'Failed to assign entity to bundle' },
        { status: 400 }
      );
    }

    // Step 4: Submit Bundle for Review
    const submitParams = new URLSearchParams({
      Status: 'pending-review',
    });

    const submitRes = await fetch(
      `https://trusthub.twilio.com/v1/CustomerProfiles/${bundleSid}`,
      { method: 'POST', headers: twilioHeaders, body: submitParams.toString() }
    );
    const submitData = await submitRes.json();

    if (!submitRes.ok) {
      console.error('Twilio bundle submission failed:', submitData);
      return NextResponse.json(
        { error: submitData?.message || 'Failed to submit brand for review' },
        { status: 400 }
      );
    }

    // Update church A2P status
    await prisma.church.update({
      where: { id: churchId },
      data: { a2pStatus: 'brand_submitted' },
    });

    return NextResponse.json({
      success: true,
      a2pStatus: 'brand_submitted',
      bundleSid,
      message: 'Brand registration submitted for review. This typically takes 1-5 business days.',
    });
  } catch (error: any) {
    console.error('A2P brand submission error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/a2p — Submit campaign registration to Twilio
 */
export async function PUT(request: NextRequest) {
  try {
    const { churchId, error } = await getEffectiveChurchId(request);
    if (error || !churchId) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const church = await prisma.church.findUnique({
      where: { id: churchId },
    });

    if (!church) {
      return NextResponse.json({ error: 'Church not found' }, { status: 404 });
    }

    if (church.provider !== 'twilio') {
      return NextResponse.json(
        { error: 'A2P campaign registration is only available for Twilio.' },
        { status: 400 }
      );
    }

    if (church.a2pStatus !== 'brand_approved') {
      return NextResponse.json(
        { error: 'Brand must be approved before submitting a campaign. Current status: ' + church.a2pStatus },
        { status: 400 }
      );
    }

    if (!church.providerAccountSid || !church.providerAuthToken) {
      return NextResponse.json(
        { error: 'Twilio credentials not configured.' },
        { status: 400 }
      );
    }

    if (!church.providerMessagingServiceSid) {
      return NextResponse.json(
        { error: 'Messaging Service SID not found. Please contact support.' },
        { status: 400 }
      );
    }

    // Decrypt credentials
    const accountSid = decrypt(church.providerAccountSid);
    const authToken = decrypt(church.providerAuthToken);

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Failed to decrypt Twilio credentials' },
        { status: 500 }
      );
    }

    const twilioAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const twilioHeaders = {
      'Authorization': `Basic ${twilioAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    // Create a US A2P Messaging Campaign
    const campaignParams = new URLSearchParams({
      BrandRegistrationSid: '', // Will be auto-detected from the account
      MessagingServiceSid: church.providerMessagingServiceSid,
      UseCase: 'MIXED',
      Description: `${church.name} church communications including event announcements, prayer requests, volunteer coordination, and general updates to congregation members.`,
      HasEmbeddedLinks: 'true',
      HasEmbeddedPhone: 'false',
      MessageFlow: 'Congregation members opt in to receive text messages from the church through a sign-up form on the church website, in-person sign-up at church events, or by texting a keyword to the church phone number. Members can opt out at any time by replying STOP.',
      'MessageSamples': JSON.stringify([
        `Hi {firstName}! Just a reminder that our Sunday service starts at 10am this week. See you there! - ${church.name}`,
        `Prayer meeting this Wednesday at 7pm in the fellowship hall. All are welcome! Reply STOP to opt out.`,
        `${church.name} Volunteer Opportunity: We need helpers for our community food drive this Saturday from 9am-1pm. Can you make it? Reply YES or NO.`,
      ]),
      OptInMessage: `You have been subscribed to text updates from ${church.name}. Reply STOP to unsubscribe. Msg&Data rates may apply.`,
      OptOutMessage: `You have been unsubscribed from ${church.name} text messages. Reply START to re-subscribe.`,
      HelpMessage: `${church.name} messaging service. For help, contact us at ${church.phone || church.email}. Reply STOP to unsubscribe.`,
      OptInKeywords: 'START, SUBSCRIBE, YES',
      OptOutKeywords: 'STOP, UNSUBSCRIBE, CANCEL, END, QUIT',
      HelpKeywords: 'HELP, INFO',
    });

    const campaignRes = await fetch(
      `https://messaging.twilio.com/v1/Services/${church.providerMessagingServiceSid}/UsAppToPersonUsecases`,
      { method: 'POST', headers: twilioHeaders, body: campaignParams.toString() }
    );
    const campaignData = await campaignRes.json();

    if (!campaignRes.ok) {
      console.error('Twilio campaign creation failed:', campaignData);
      return NextResponse.json(
        { error: campaignData?.message || 'Failed to create messaging campaign' },
        { status: 400 }
      );
    }

    // Update church A2P status
    await prisma.church.update({
      where: { id: churchId },
      data: { a2pStatus: 'campaign_submitted' },
    });

    return NextResponse.json({
      success: true,
      a2pStatus: 'campaign_submitted',
      message: 'Campaign registration submitted. Review typically takes 1-3 business days.',
    });
  } catch (error: any) {
    console.error('A2P campaign submission error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
