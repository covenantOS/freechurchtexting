const GSM_7_CHARS = '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà';
const GSM_7_EXTENDED = '^{}\\[~]|€';

export function isGSM7(text: string): boolean {
  for (const char of text) {
    if (!GSM_7_CHARS.includes(char) && !GSM_7_EXTENDED.includes(char)) {
      return false;
    }
  }
  return true;
}

export function countGSM7Length(text: string): number {
  let length = 0;
  for (const char of text) {
    if (GSM_7_EXTENDED.includes(char)) {
      length += 2;
    } else {
      length += 1;
    }
  }
  return length;
}

export function calculateSegments(text: string): { segments: number; charCount: number; encoding: string; maxChars: number } {
  if (!text) return { segments: 0, charCount: 0, encoding: 'GSM-7', maxChars: 160 };
  
  const isGsm = isGSM7(text);
  const charCount = isGsm ? countGSM7Length(text) : text.length;
  const encoding = isGsm ? 'GSM-7' : 'UCS-2';
  
  let segments: number;
  let maxChars: number;
  
  if (isGsm) {
    if (charCount <= 160) {
      segments = 1;
      maxChars = 160;
    } else {
      segments = Math.ceil(charCount / 153);
      maxChars = 153;
    }
  } else {
    if (charCount <= 70) {
      segments = 1;
      maxChars = 70;
    } else {
      segments = Math.ceil(charCount / 67);
      maxChars = 67;
    }
  }
  
  return { segments, charCount, encoding, maxChars };
}

export function calculateCost(segments: number, recipientCount: number, costPerSegment: number = 0.0079): number {
  return segments * recipientCount * costPerSegment;
}

export function formatCost(cost: number): string {
  return cost < 0.01 ? '<$0.01' : `$${cost.toFixed(2)}`;
}
