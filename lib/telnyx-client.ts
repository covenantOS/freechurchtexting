export interface TelnyxCredentials {
  apiKey: string;
  phoneNumber?: string;
  messagingProfileId?: string;
}

export async function verifyTelnyxCredentials(apiKey: string): Promise<{ valid: boolean; error?: string; friendlyName?: string }> {
  try {
    const response = await fetch('https://api.telnyx.com/v2/messaging_profiles', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      return { valid: true, friendlyName: 'Telnyx Account' };
    } else {
      const error = await response.json().catch(() => ({}));
      return { valid: false, error: error?.errors?.[0]?.detail || 'Invalid API key' };
    }
  } catch (error: any) {
    return { valid: false, error: error?.message || 'Failed to verify credentials' };
  }
}

export async function searchTelnyxAvailableNumbers(apiKey: string, areaCode: string): Promise<{ numbers: any[]; error?: string }> {
  try {
    const params = new URLSearchParams({
      'filter[phone_number][starts_with]': `+1${areaCode}`,
      'filter[features]': 'sms',
      'filter[limit]': '20',
    });
    
    const response = await fetch(
      `https://api.telnyx.com/v2/available_phone_numbers?${params}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      const numbers = (data.data || []).map((num: any) => ({
        phoneNumber: num.phone_number,
        friendlyName: num.phone_number,
        locality: num.locality || '',
        region: num.region_information?.[0]?.region_name || '',
        capabilities: num.features || [],
      }));
      return { numbers };
    } else {
      const error = await response.json().catch(() => ({}));
      return { numbers: [], error: error?.errors?.[0]?.detail || 'Failed to search numbers' };
    }
  } catch (error: any) {
    return { numbers: [], error: error?.message || 'Failed to search numbers' };
  }
}

export async function purchaseTelnyxPhoneNumber(apiKey: string, phoneNumber: string): Promise<{ success: boolean; error?: string; sid?: string }> {
  try {
    const response = await fetch(
      'https://api.telnyx.com/v2/number_orders',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_numbers: [{ phone_number: phoneNumber }],
        }),
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      return { success: true, sid: data.data?.id };
    } else {
      const error = await response.json().catch(() => ({}));
      return { success: false, error: error?.errors?.[0]?.detail || 'Failed to purchase number' };
    }
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to purchase number' };
  }
}

export async function sendTelnyxSMS(
  apiKey: string,
  to: string,
  body: string,
  from?: string,
  messagingProfileId?: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  try {
    const payload: Record<string, string> = { 
      to, 
      text: body,
    };
    
    if (messagingProfileId) {
      payload.messaging_profile_id = messagingProfileId;
    }
    
    if (from) {
      payload.from = from;
    }
    
    const response = await fetch(
      'https://api.telnyx.com/v2/messages',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      return { success: true, messageSid: data.data?.id };
    } else {
      const error = await response.json().catch(() => ({}));
      return { success: false, error: error?.errors?.[0]?.detail || 'Failed to send SMS' };
    }
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to send SMS' };
  }
}
