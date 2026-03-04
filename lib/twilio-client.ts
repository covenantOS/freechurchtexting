import { decrypt } from './encryption';

export interface TwilioCredentials {
  accountSid: string;
  authToken: string;
  phoneNumber?: string;
  messagingServiceSid?: string;
}

export async function verifyTwilioCredentials(accountSid: string, authToken: string): Promise<{ valid: boolean; error?: string; friendlyName?: string }> {
  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      return { valid: true, friendlyName: data.friendly_name };
    } else {
      const error = await response.json().catch(() => ({}));
      return { valid: false, error: error?.message || 'Invalid credentials' };
    }
  } catch (error: any) {
    return { valid: false, error: error?.message || 'Failed to verify credentials' };
  }
}

export async function searchAvailableNumbers(accountSid: string, authToken: string, areaCode: string): Promise<{ numbers: any[]; error?: string }> {
  try {
    const params = new URLSearchParams({
      AreaCode: areaCode,
      SmsEnabled: 'true',
      VoiceEnabled: 'true',
    });
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/AvailablePhoneNumbers/US/Local.json?${params}`,
      {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        },
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      return { numbers: data.available_phone_numbers || [] };
    } else {
      const error = await response.json().catch(() => ({}));
      return { numbers: [], error: error?.message || 'Failed to search numbers' };
    }
  } catch (error: any) {
    return { numbers: [], error: error?.message || 'Failed to search numbers' };
  }
}

export async function purchasePhoneNumber(accountSid: string, authToken: string, phoneNumber: string): Promise<{ success: boolean; error?: string; sid?: string }> {
  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ PhoneNumber: phoneNumber }),
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      return { success: true, sid: data.sid };
    } else {
      const error = await response.json().catch(() => ({}));
      return { success: false, error: error?.message || 'Failed to purchase number' };
    }
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to purchase number' };
  }
}

export async function sendSMS(
  accountSid: string,
  authToken: string,
  to: string,
  body: string,
  from?: string,
  messagingServiceSid?: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  try {
    const formData: Record<string, string> = { To: to, Body: body };
    
    if (messagingServiceSid) {
      formData.MessagingServiceSid = messagingServiceSid;
    } else if (from) {
      formData.From = from;
    } else {
      return { success: false, error: 'Either From number or MessagingServiceSid is required' };
    }
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formData),
      }
    );
    
    if (response.ok || response.status === 201) {
      const data = await response.json();
      return { success: true, messageSid: data.sid };
    } else {
      const error = await response.json().catch(() => ({}));
      return { success: false, error: error?.message || 'Failed to send SMS' };
    }
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to send SMS' };
  }
}
