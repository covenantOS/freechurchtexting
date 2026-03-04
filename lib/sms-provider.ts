// Unified SMS Provider Interface
import { sendSMS as sendTwilioSMS, verifyTwilioCredentials, searchAvailableNumbers as searchTwilioNumbers, purchasePhoneNumber as purchaseTwilioNumber } from './twilio-client';
import { sendTelnyxSMS, verifyTelnyxCredentials, searchTelnyxAvailableNumbers, purchaseTelnyxPhoneNumber } from './telnyx-client';
import { decrypt } from './encryption';

export type ProviderType = 'twilio' | 'telnyx';

export interface ProviderCredentials {
  provider: ProviderType;
  accountSid?: string; // Twilio Account SID or Telnyx API Key
  authToken?: string;  // Twilio Auth Token (not used for Telnyx)
  phoneNumber?: string;
  messagingServiceSid?: string; // Twilio Messaging Service SID or Telnyx Messaging Profile ID
}

export async function verifyProviderCredentials(
  provider: ProviderType,
  accountSid: string,
  authToken: string
): Promise<{ valid: boolean; error?: string; friendlyName?: string }> {
  if (provider === 'telnyx') {
    // For Telnyx, accountSid contains the API key
    return verifyTelnyxCredentials(accountSid);
  }
  return verifyTwilioCredentials(accountSid, authToken);
}

export async function searchAvailableNumbers(
  provider: ProviderType,
  accountSid: string,
  authToken: string,
  areaCode: string
): Promise<{ numbers: any[]; error?: string }> {
  if (provider === 'telnyx') {
    return searchTelnyxAvailableNumbers(accountSid, areaCode);
  }
  return searchTwilioNumbers(accountSid, authToken, areaCode);
}

export async function purchasePhoneNumber(
  provider: ProviderType,
  accountSid: string,
  authToken: string,
  phoneNumber: string
): Promise<{ success: boolean; error?: string; sid?: string }> {
  if (provider === 'telnyx') {
    return purchaseTelnyxPhoneNumber(accountSid, phoneNumber);
  }
  return purchaseTwilioNumber(accountSid, authToken, phoneNumber);
}

export async function sendProviderSMS(
  credentials: ProviderCredentials,
  to: string,
  body: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  const { provider, accountSid, authToken, phoneNumber, messagingServiceSid } = credentials;
  
  if (!accountSid) {
    return { success: false, error: 'Provider credentials not configured' };
  }
  
  if (provider === 'telnyx') {
    return sendTelnyxSMS(accountSid, to, body, phoneNumber, messagingServiceSid);
  }
  
  if (!authToken) {
    return { success: false, error: 'Twilio auth token not configured' };
  }
  
  return sendTwilioSMS(accountSid, authToken, to, body, phoneNumber, messagingServiceSid);
}

// Helper to get decrypted credentials from church record
export function getProviderCredentials(church: {
  provider: ProviderType;
  providerAccountSid?: string | null;
  providerAuthToken?: string | null;
  providerPhoneNumber?: string | null;
  providerMessagingServiceSid?: string | null;
}): ProviderCredentials {
  return {
    provider: church.provider,
    accountSid: church.providerAccountSid ? decrypt(church.providerAccountSid) : undefined,
    authToken: church.providerAuthToken ? decrypt(church.providerAuthToken) : undefined,
    phoneNumber: church.providerPhoneNumber || undefined,
    messagingServiceSid: church.providerMessagingServiceSid || undefined,
  };
}
