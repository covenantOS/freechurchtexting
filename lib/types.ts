import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      churchId: string;
      churchName: string;
      role: 'admin' | 'member';
      onboardingCompleted: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    churchId: string;
    churchName: string;
    role: 'admin' | 'member';
    onboardingCompleted: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    churchId: string;
    churchName: string;
    role: 'admin' | 'member';
    onboardingCompleted: boolean;
  }
}

export interface Contact {
  id: string;
  churchId: string;
  firstName: string;
  lastName?: string | null;
  phone: string;
  email?: string | null;
  groups: string[];
  tags: string[];
  notes?: string | null;
  optInStatus: 'opted_in' | 'opted_out' | 'pending';
  optInDate?: Date | null;
  optOutDate?: Date | null;
  source: 'manual' | 'csv_import';
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  churchId: string;
  name: string;
  description?: string | null;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  memberCount?: number;
}

export interface Template {
  id: string;
  churchId: string;
  name: string;
  body: string;
  category: 'general' | 'event' | 'prayer' | 'welcome' | 'volunteer';
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  churchId: string;
  senderUserId: string;
  type: 'individual' | 'blast';
  recipientContactId?: string | null;
  recipientGroupId?: string | null;
  body: string;
  status: 'queued' | 'sending' | 'sent' | 'delivered' | 'failed';
  sentAt?: Date | null;
  providerMessageSid?: string | null;
  segmentsUsed: number;
  totalRecipients: number;
  errorMessage?: string | null;
  createdAt: Date;
}
