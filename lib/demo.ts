export function isDemoChurch(churchId: string): boolean {
  return process.env.DEMO_CHURCH_IDS?.split(',').includes(churchId) ?? false;
}

export function simulateSMSResult(): { success: boolean; messageSid: string } {
  // 95% success rate simulation
  const success = Math.random() > 0.05;
  return {
    success,
    messageSid: success ? `SM_DEMO_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` : '',
  };
}
