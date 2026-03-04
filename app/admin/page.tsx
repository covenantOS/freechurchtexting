'use client';

import React, { Suspense, useEffect, useState, useMemo, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAdmin } from '@/lib/admin-context';
import { toast } from 'sonner';
import {
  Users,
  Building2,
  MessageSquare,
  Search,
  Eye,
  CheckCircle2,
  Crown,
  Sparkles,
  Phone,
  Shield,
  X,
  LogOut,
  Trash2,
  ArrowUpCircle,
  RotateCcw,
  MoreHorizontal,
  Loader2,
  TrendingUp,
  Clock,
  Globe,
  Mail,
  MapPin,
  FileText,
  Settings,
  Zap,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Hash,
  UserCheck,
  Activity,
  BarChart3,
  RefreshCw,
} from 'lucide-react';

// ----- Types -----

interface ChurchData {
  id: string;
  name: string;
  slug: string | null;
  leaderName: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  website: string | null;
  ein: string | null;
  provider: string;
  providerPhoneNumber: string | null;
  a2pStatus: string;
  subscriptionTier: string;
  onboardingCompleted: boolean;
  complianceCompletedAt: string | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

interface UserWithStats {
  id: string;
  name: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
  churchId: string;
  createdAt: string;
  church: ChurchData;
  stats: {
    contactCount: number;
    messageCount: number;
    userCount: number;
    lastMessageAt: string | null;
  };
}

interface ChurchDetail {
  id: string;
  name: string;
  slug: string | null;
  leaderName: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  website: string | null;
  ein: string | null;
  provider: string;
  providerPhoneNumber: string | null;
  a2pStatus: string;
  subscriptionTier: string;
  onboardingCompleted: boolean;
  complianceCompletedAt: string | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
  lastInboundAt: string | null;
  users: {
    id: string;
    name: string;
    email: string;
    role: string;
    isSuperAdmin: boolean;
    createdAt: string;
  }[];
  _count: {
    contacts: number;
    messages: number;
    templates: number;
    groups: number;
    scheduledMessages: number;
    autoReplies: number;
    inboundMessages: number;
  };
}

// ----- Helpers -----

function getRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// ----- Sub-Components -----

function TierBadge({ tier }: { tier: string }) {
  switch (tier) {
    case 'blue_dedicated':
      return (
        <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
          <Crown className="h-3 w-3 mr-1" />
          Blue Dedicated
        </Badge>
      );
    case 'blue_shared':
      return (
        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
          <Sparkles className="h-3 w-3 mr-1" />
          Blue Shared
        </Badge>
      );
    default:
      return <Badge variant="outline">Free (SMS)</Badge>;
  }
}

function A2PBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    not_started: { label: 'Not Started', className: 'bg-gray-100 text-gray-600' },
    brand_submitted: { label: 'Brand Submitted', className: 'bg-blue-100 text-blue-700' },
    brand_approved: { label: 'Brand Approved', className: 'bg-blue-100 text-blue-700' },
    campaign_submitted: { label: 'Campaign Submitted', className: 'bg-indigo-100 text-indigo-700' },
    campaign_approved: { label: 'Campaign Approved', className: 'bg-indigo-100 text-indigo-700' },
    fully_approved: { label: 'Fully Approved', className: 'bg-green-100 text-green-700' },
    rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
  };
  const { label, className } = config[status] || config.not_started;
  return <Badge className={className}>{label}</Badge>;
}

function ProviderBadge({ provider, tier }: { provider: string; tier: string }) {
  if (tier.startsWith('blue')) {
    return <Badge className="bg-blue-100 text-blue-700 text-xs">iMessage/RCS</Badge>;
  }
  if (provider === 'telnyx') {
    return <Badge className="bg-purple-100 text-purple-700 text-xs">Telnyx</Badge>;
  }
  return <Badge variant="outline" className="text-xs">{provider || 'Not Set'}</Badge>;
}

function StatCard({
  icon: Icon,
  value,
  label,
  bgColor,
  iconColor,
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  bgColor: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white/[0.07] backdrop-blur-sm rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 ${bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          <p className="text-xs text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}

// ----- Church Detail Slide-Over -----

function ChurchDetailPanel({
  churchId,
  onClose,
  onViewAsUser,
  onChangeTier,
  onResetOnboarding,
  onCompleteOnboarding,
  onDeleteUser,
  users,
}: {
  churchId: string;
  onClose: () => void;
  onViewAsUser: (user: UserWithStats) => void;
  onChangeTier: (user: UserWithStats) => void;
  onResetOnboarding: (user: UserWithStats) => void;
  onCompleteOnboarding: (user: UserWithStats) => void;
  onDeleteUser: (user: UserWithStats) => void;
  users: UserWithStats[];
}) {
  const [detail, setDetail] = useState<ChurchDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Find the primary user for this church from the users list
  const primaryUser = useMemo(
    () => users.find((u) => u.churchId === churchId && !u.isSuperAdmin) || users.find((u) => u.churchId === churchId),
    [users, churchId]
  );

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/churches/${churchId}`);
        if (res.ok) {
          setDetail(await res.json());
        } else {
          toast.error('Failed to load church details');
        }
      } catch {
        toast.error('Failed to load church details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [churchId]);

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#C28C88]/20 to-[#C28C88]/40 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-[#C28C88]">
                {detail?.name?.[0] || '?'}
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 truncate">{detail?.name || 'Loading...'}</h2>
              <p className="text-xs text-gray-500 truncate">{detail?.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-6 w-6 animate-spin text-[#C28C88]" />
            </div>
          ) : detail ? (
            <Tabs defaultValue="overview" className="w-full">
              <div className="px-6 pt-4 border-b border-gray-100">
                <TabsList className="w-full justify-start bg-gray-100/80">
                  <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                  <TabsTrigger value="users" className="text-xs">Users ({detail.users.length})</TabsTrigger>
                  <TabsTrigger value="compliance" className="text-xs">Compliance</TabsTrigger>
                  <TabsTrigger value="stats" className="text-xs">Stats</TabsTrigger>
                  <TabsTrigger value="actions" className="text-xs">Actions</TabsTrigger>
                </TabsList>
              </div>

              {/* -- Overview Tab -- */}
              <TabsContent value="overview" className="px-6 py-4 space-y-5">
                {/* Tier + Status Row */}
                <div className="flex flex-wrap items-center gap-2">
                  <TierBadge tier={detail.subscriptionTier} />
                  <ProviderBadge provider={detail.provider} tier={detail.subscriptionTier} />
                  <A2PBadge status={detail.a2pStatus} />
                  {detail.onboardingCompleted ? (
                    <Badge variant="success">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Onboarded
                    </Badge>
                  ) : (
                    <Badge variant="warning">
                      <Clock className="h-3 w-3 mr-1" />
                      Onboarding
                    </Badge>
                  )}
                </div>

                {/* Church Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoRow icon={Building2} label="Church Name" value={detail.name} />
                  <InfoRow icon={UserCheck} label="Leader" value={detail.leaderName || 'Not set'} />
                  <InfoRow icon={Mail} label="Email" value={detail.email} />
                  <InfoRow icon={Phone} label="Phone" value={detail.phone || 'Not set'} />
                  <InfoRow icon={Globe} label="Website" value={detail.website || 'Not set'} link={detail.website} />
                  <InfoRow icon={Hash} label="EIN" value={detail.ein || 'Not set'} />
                  <InfoRow
                    icon={MapPin}
                    label="Address"
                    value={
                      [detail.address, detail.city, detail.state, detail.zip].filter(Boolean).join(', ') || 'Not set'
                    }
                  />
                  <InfoRow icon={Clock} label="Timezone" value={detail.timezone} />
                </div>

                {/* Provider Details */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700">Provider Details</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Provider:</span>{' '}
                      <span className="font-medium text-gray-900 capitalize">{detail.provider}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone Number:</span>{' '}
                      <span className="font-medium text-gray-900">{detail.providerPhoneNumber || 'Not set'}</span>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700">Timeline</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Created:</span>{' '}
                      <span className="font-medium text-gray-900">{formatDate(detail.createdAt)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Updated:</span>{' '}
                      <span className="font-medium text-gray-900">{formatDate(detail.updatedAt)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Sent:</span>{' '}
                      <span className="font-medium text-gray-900">{formatDateTime(detail.lastMessageAt)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Inbound:</span>{' '}
                      <span className="font-medium text-gray-900">{formatDateTime(detail.lastInboundAt)}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* -- Users Tab -- */}
              <TabsContent value="users" className="px-6 py-4 space-y-3">
                {detail.users.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No users found</p>
                ) : (
                  detail.users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#C28C88]/20 to-[#C28C88]/40 flex items-center justify-center">
                          <span className="text-xs font-bold text-[#C28C88]">{user.name[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-[10px]">
                          {user.role}
                        </Badge>
                        {user.isSuperAdmin && (
                          <Badge variant="destructive" className="text-[10px]">Super Admin</Badge>
                        )}
                        <span className="text-xs text-gray-400">{formatDate(user.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              {/* -- Compliance Tab -- */}
              <TabsContent value="compliance" className="px-6 py-4 space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
                    <Shield className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">A2P Registration Status</p>
                      <div className="mt-1">
                        <A2PBadge status={detail.a2pStatus} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
                    <CheckCircle2 className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Compliance Completion</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {detail.complianceCompletedAt
                          ? `Completed on ${formatDateTime(detail.complianceCompletedAt)}`
                          : 'Not completed'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Slug / Opt-In Page</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {detail.slug ? (
                          <span className="text-blue-600">/opt-in/{detail.slug}</span>
                        ) : (
                          'No slug set'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
                    <Building2 className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">EIN</p>
                      <p className="text-xs text-gray-500 mt-0.5">{detail.ein || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* -- Stats Tab -- */}
              <TabsContent value="stats" className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <StatCardLight icon={Users} label="Contacts" value={detail._count.contacts} />
                  <StatCardLight icon={MessageSquare} label="Messages Sent" value={detail._count.messages} />
                  <StatCardLight icon={Mail} label="Inbound Messages" value={detail._count.inboundMessages} />
                  <StatCardLight icon={FileText} label="Templates" value={detail._count.templates} />
                  <StatCardLight icon={Hash} label="Groups" value={detail._count.groups} />
                  <StatCardLight icon={Clock} label="Scheduled" value={detail._count.scheduledMessages} />
                  <StatCardLight icon={Zap} label="Auto Replies" value={detail._count.autoReplies} />
                  <StatCardLight icon={UserCheck} label="Team Members" value={detail.users.length} />
                </div>
              </TabsContent>

              {/* -- Actions Tab -- */}
              <TabsContent value="actions" className="px-6 py-4 space-y-3">
                {primaryUser && (
                  <>
                    <button
                      onClick={() => onViewAsUser(primaryUser)}
                      className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-[#C28C88] hover:bg-[#C28C88]/5 transition-all text-left group"
                    >
                      <Eye className="h-5 w-5 text-gray-400 group-hover:text-[#C28C88]" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Login as User</p>
                        <p className="text-xs text-gray-500">View the dashboard as this church</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 ml-auto group-hover:text-[#C28C88]" />
                    </button>

                    <button
                      onClick={() => onChangeTier(primaryUser)}
                      className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left group"
                    >
                      <ArrowUpCircle className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Change Subscription Tier</p>
                        <p className="text-xs text-gray-500">
                          Currently: {detail.subscriptionTier.replace('_', ' ')}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 ml-auto group-hover:text-blue-500" />
                    </button>

                    {detail.onboardingCompleted ? (
                      <button
                        onClick={() => onResetOnboarding(primaryUser)}
                        className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all text-left group"
                      >
                        <RotateCcw className="h-5 w-5 text-gray-400 group-hover:text-amber-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Reset Onboarding</p>
                          <p className="text-xs text-gray-500">Force the church through setup again</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-300 ml-auto group-hover:text-amber-500" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onCompleteOnboarding(primaryUser)}
                        className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50/50 transition-all text-left group"
                      >
                        <CheckCircle2 className="h-5 w-5 text-gray-400 group-hover:text-green-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Complete Onboarding</p>
                          <p className="text-xs text-gray-500">Mark onboarding as finished</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-300 ml-auto group-hover:text-green-500" />
                      </button>
                    )}

                    <div className="pt-3 border-t border-gray-100">
                      <button
                        onClick={() => onDeleteUser(primaryUser)}
                        className="w-full flex items-center gap-3 p-4 rounded-lg border border-red-100 hover:border-red-300 hover:bg-red-50/50 transition-all text-left group"
                      >
                        <Trash2 className="h-5 w-5 text-red-300 group-hover:text-red-500" />
                        <div>
                          <p className="text-sm font-medium text-red-600">Delete Church Account</p>
                          <p className="text-xs text-red-400">Permanently delete all data for this church</p>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              Failed to load details
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  link,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  link?: string | null;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] text-gray-400 uppercase tracking-wider">{label}</p>
        {link ? (
          <a
            href={link.startsWith('http') ? link : `https://${link}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            {value}
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <p className="text-sm text-gray-900 truncate">{value}</p>
        )}
      </div>
    </div>
  );
}

function StatCardLight({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
      <Icon className="h-4 w-4 text-gray-400" />
      <div>
        <p className="text-lg font-bold text-gray-900">{value.toLocaleString()}</p>
        <p className="text-[11px] text-gray-500">{label}</p>
      </div>
    </div>
  );
}

// ----- Main Admin Content -----

function AdminPageContent() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const { setImpersonatedUser } = useAdmin();

  // Data state
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [a2pFilter, setA2PFilter] = useState<string>('all');

  // UI state
  const [actionDropdownUserId, setActionDropdownUserId] = useState<string | null>(null);
  const [upgradeModalUser, setUpgradeModalUser] = useState<UserWithStats | null>(null);
  const [selectedTier, setSelectedTier] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedChurchId, setSelectedChurchId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user || !(session.user as any).isSuperAdmin) {
      router.push('/dashboard');
      return;
    }
    fetchUsers();
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // ----- Admin Actions -----

  const handleDeleteUser = async (user: UserWithStats) => {
    if (
      !confirm(
        `Are you sure you want to delete ${user.church.name}? This will permanently delete all their data including contacts, messages, and templates.`
      )
    )
      return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success(`${user.church.name} has been deleted`);
        setSelectedChurchId(null);
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete user');
      }
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setActionLoading(false);
      setActionDropdownUserId(null);
    }
  };

  const handleResetOnboarding = async (user: UserWithStats) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_onboarding' }),
      });
      if (response.ok) {
        toast.success(`Onboarding reset for ${user.church.name}`);
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to reset onboarding');
      }
    } catch {
      toast.error('Failed to reset onboarding');
    } finally {
      setActionLoading(false);
      setActionDropdownUserId(null);
    }
  };

  const handleCompleteOnboarding = async (user: UserWithStats) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete_onboarding' }),
      });
      if (response.ok) {
        toast.success(`Onboarding completed for ${user.church.name}`);
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to complete onboarding');
      }
    } catch {
      toast.error('Failed to complete onboarding');
    } finally {
      setActionLoading(false);
      setActionDropdownUserId(null);
    }
  };

  const handleUpgrade = async () => {
    if (!upgradeModalUser || !selectedTier) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${upgradeModalUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upgrade', subscriptionTier: selectedTier }),
      });
      if (response.ok) {
        toast.success(`${upgradeModalUser.church.name} updated to ${selectedTier.replace('_', ' ')}`);
        fetchUsers();
        setUpgradeModalUser(null);
        setSelectedTier('');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to upgrade');
      }
    } catch {
      toast.error('Failed to upgrade');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewAsUser = (user: UserWithStats) => {
    setImpersonatedUser({
      id: user.id,
      email: user.email,
      name: user.name,
      churchId: user.church.id,
      churchName: user.church.name,
      subscriptionTier: user.church.subscriptionTier,
      onboardingCompleted: user.church.onboardingCompleted,
    });
    setTimeout(() => router.push('/dashboard'), 50);
  };

  // ----- Computed -----

  const nonAdminUsers = useMemo(() => users.filter((u) => !u.isSuperAdmin), [users]);

  const filteredUsers = useMemo(() => {
    return nonAdminUsers.filter((user) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.church.name.toLowerCase().includes(term) ||
        (user.church.leaderName || '').toLowerCase().includes(term);

      const matchesTier =
        tierFilter === 'all' ||
        (tierFilter === 'free' && user.church.subscriptionTier === 'free') ||
        (tierFilter === 'blue_shared' && user.church.subscriptionTier === 'blue_shared') ||
        (tierFilter === 'blue_dedicated' && user.church.subscriptionTier === 'blue_dedicated');

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && user.church.onboardingCompleted) ||
        (statusFilter === 'onboarding' && !user.church.onboardingCompleted) ||
        (statusFilter === 'no_messages' && user.stats.messageCount === 0) ||
        (statusFilter === 'no_provider' && !user.church.providerPhoneNumber);

      const matchesA2P =
        a2pFilter === 'all' || user.church.a2pStatus === a2pFilter;

      return matchesSearch && matchesTier && matchesStatus && matchesA2P;
    });
  }, [nonAdminUsers, searchTerm, tierFilter, statusFilter, a2pFilter]);

  const recentSignups = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return nonAdminUsers
      .filter((u) => new Date(u.createdAt) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [nonAdminUsers]);

  const needsAttention = useMemo(() => {
    return nonAdminUsers.filter(
      (u) =>
        !u.church.onboardingCompleted ||
        u.stats.messageCount === 0 ||
        !u.church.providerPhoneNumber
    );
  }, [nonAdminUsers]);

  const stats = useMemo(
    () => ({
      totalChurches: nonAdminUsers.length,
      freeUsers: nonAdminUsers.filter((u) => u.church.subscriptionTier === 'free').length,
      blueShared: nonAdminUsers.filter((u) => u.church.subscriptionTier === 'blue_shared').length,
      blueDedicated: nonAdminUsers.filter((u) => u.church.subscriptionTier === 'blue_dedicated').length,
      totalContacts: nonAdminUsers.reduce((s, u) => s + u.stats.contactCount, 0),
      totalMessages: nonAdminUsers.reduce((s, u) => s + u.stats.messageCount, 0),
      activeUsers: nonAdminUsers.filter((u) => u.church.onboardingCompleted).length,
      onboardingUsers: nonAdminUsers.filter((u) => !u.church.onboardingCompleted).length,
      recentCount: recentSignups.length,
      attentionCount: needsAttention.length,
    }),
    [nonAdminUsers, recentSignups, needsAttention]
  );

  // ----- Render -----

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-2 border-[#C28C88] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!(session?.user as any)?.isSuperAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-white/10 text-white py-3 px-6">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-[#C28C88]/20 p-2.5">
              <Shield className="h-6 w-6 text-[#C28C88]" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Admin CRM</h1>
              <p className="text-gray-400 text-xs">Free Church Texting Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-white/10 h-8 text-xs"
              onClick={fetchUsers}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Refresh
            </Button>
            <span className="text-gray-500 text-xs hidden sm:inline">{session?.user?.email}</span>
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-white/10 h-8 text-xs"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="h-3.5 w-3.5 mr-1" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard icon={Building2} value={stats.totalChurches} label="Total Churches" bgColor="bg-[#C28C88]/20" iconColor="text-[#C28C88]" />
          <StatCard icon={Users} value={stats.totalContacts} label="Total Contacts" bgColor="bg-indigo-500/20" iconColor="text-indigo-400" />
          <StatCard icon={MessageSquare} value={stats.totalMessages} label="Messages Sent" bgColor="bg-purple-500/20" iconColor="text-purple-400" />
          <StatCard icon={TrendingUp} value={stats.recentCount} label="New (7 days)" bgColor="bg-green-500/20" iconColor="text-green-400" />
          <StatCard icon={AlertTriangle} value={stats.attentionCount} label="Need Attention" bgColor="bg-amber-500/20" iconColor="text-amber-400" />
        </div>

        {/* Tier Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/[0.05] backdrop-blur-sm rounded-xl border border-white/10 p-3 flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-gray-400" />
            <div>
              <p className="text-white font-semibold">{stats.freeUsers}</p>
              <p className="text-[11px] text-gray-500">Free Tier</p>
            </div>
          </div>
          <div className="bg-white/[0.05] backdrop-blur-sm rounded-xl border border-white/10 p-3 flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <div>
              <p className="text-white font-semibold">{stats.blueShared}</p>
              <p className="text-[11px] text-gray-500">Blue Shared</p>
            </div>
          </div>
          <div className="bg-white/[0.05] backdrop-blur-sm rounded-xl border border-white/10 p-3 flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <div>
              <p className="text-white font-semibold">{stats.blueDedicated}</p>
              <p className="text-[11px] text-gray-500">Blue Dedicated</p>
            </div>
          </div>
          <div className="bg-white/[0.05] backdrop-blur-sm rounded-xl border border-white/10 p-3 flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
            <div>
              <p className="text-white font-semibold">{stats.activeUsers}</p>
              <p className="text-[11px] text-gray-500">Active / {stats.onboardingUsers} Onboarding</p>
            </div>
          </div>
        </div>

        {/* Recent Signups */}
        {recentSignups.length > 0 && (
          <div className="bg-white/[0.05] backdrop-blur-sm rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <h3 className="text-sm font-semibold text-white">Recent Signups (Last 7 Days)</h3>
              <Badge className="bg-green-500/20 text-green-400 text-[10px]">{recentSignups.length}</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {recentSignups.slice(0, 10).map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedChurchId(user.church.id)}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-white/5 hover:border-[#C28C88]/30 hover:bg-white/5 transition-all text-left group"
                >
                  <div className="h-8 w-8 rounded-full bg-[#C28C88]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-[#C28C88]">{user.church.name[0]}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-xs font-medium truncate">{user.church.name}</p>
                    <p className="text-gray-500 text-[10px]">{getRelativeTime(user.createdAt)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Needs Attention */}
        {needsAttention.length > 0 && (
          <div className="bg-white/[0.05] backdrop-blur-sm rounded-xl border border-amber-500/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Needs Attention</h3>
              <Badge className="bg-amber-500/20 text-amber-400 text-[10px]">{needsAttention.length}</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {needsAttention.slice(0, 6).map((user) => {
                const reasons: string[] = [];
                if (!user.church.onboardingCompleted) reasons.push('Incomplete onboarding');
                if (user.stats.messageCount === 0) reasons.push('No messages sent');
                if (!user.church.providerPhoneNumber) reasons.push('No phone number');
                return (
                  <button
                    key={user.id}
                    onClick={() => setSelectedChurchId(user.church.id)}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg border border-amber-500/10 hover:border-amber-500/30 hover:bg-white/5 transition-all text-left group"
                  >
                    <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-xs font-medium truncate">{user.church.name}</p>
                      <p className="text-amber-400/70 text-[10px] truncate">{reasons.join(' / ')}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Church Table */}
        <div className="bg-white/[0.05] backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          {/* Table Header / Filters */}
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-gray-400" />
                <h3 className="text-sm font-semibold text-white">All Churches</h3>
                <Badge className="bg-white/10 text-gray-300 text-[10px]">{filteredUsers.length}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {/* Tier Filter */}
                <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'free', label: 'Free' },
                    { value: 'blue_shared', label: 'Shared' },
                    { value: 'blue_dedicated', label: 'Dedicated' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTierFilter(opt.value)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                        tierFilter === opt.value
                          ? 'bg-white/10 text-white'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {/* Status Filter */}
                <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'active', label: 'Active' },
                    { value: 'onboarding', label: 'Onboarding' },
                    { value: 'no_messages', label: 'No Messages' },
                    { value: 'no_provider', label: 'No Phone' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setStatusFilter(opt.value)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                        statusFilter === opt.value
                          ? 'bg-white/10 text-white'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {/* A2P Filter */}
                <select
                  value={a2pFilter}
                  onChange={(e) => setA2PFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 text-gray-300 text-[11px] rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C28C88]"
                >
                  <option value="all">All A2P</option>
                  <option value="not_started">Not Started</option>
                  <option value="brand_submitted">Brand Submitted</option>
                  <option value="brand_approved">Brand Approved</option>
                  <option value="campaign_submitted">Campaign Submitted</option>
                  <option value="campaign_approved">Campaign Approved</option>
                  <option value="fully_approved">Fully Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                {/* Search */}
                <div className="relative w-56">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                  <input
                    placeholder="Search churches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-8 pl-8 pr-3 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C28C88] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-2.5 px-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Church / User</th>
                  <th className="text-left py-2.5 px-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Tier</th>
                  <th className="text-left py-2.5 px-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Provider</th>
                  <th className="text-left py-2.5 px-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">A2P</th>
                  <th className="text-left py-2.5 px-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Contacts</th>
                  <th className="text-left py-2.5 px-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Messages</th>
                  <th className="text-left py-2.5 px-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-2.5 px-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Last Activity</th>
                  <th className="text-right py-2.5 px-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => (
                  <tr
                    key={user.id}
                    className={`border-b border-white/[0.03] hover:bg-white/[0.04] transition-colors cursor-pointer group ${
                      idx % 2 === 0 ? 'bg-white/[0.01]' : ''
                    }`}
                    onClick={() => setSelectedChurchId(user.church.id)}
                  >
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-[#C28C88]/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-[#C28C88]">{user.church.name[0]}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate max-w-[200px]">{user.church.name}</p>
                          <p className="text-gray-500 text-[11px] truncate max-w-[200px]">
                            {user.church.leaderName || user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <TierBadge tier={user.church.subscriptionTier} />
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <ProviderBadge provider={user.church.provider} tier={user.church.subscriptionTier} />
                        {user.church.providerPhoneNumber && (
                          <span className="text-[10px] text-gray-500 hidden xl:inline">
                            {user.church.providerPhoneNumber}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <A2PBadge status={user.church.a2pStatus} />
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="text-sm font-medium text-gray-300">{user.stats.contactCount.toLocaleString()}</span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="text-sm font-medium text-gray-300">{user.stats.messageCount.toLocaleString()}</span>
                    </td>
                    <td className="py-2.5 px-4">
                      {user.church.onboardingCompleted ? (
                        <span className="inline-flex items-center gap-1 text-green-400 text-[11px] font-medium">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-400 text-[11px] font-medium">
                          <Clock className="h-3 w-3" /> Onboarding
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="text-[11px] text-gray-500">
                        {user.stats.lastMessageAt ? getRelativeTime(user.stats.lastMessageAt) : 'Never'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-500 hover:text-[#C28C88] hover:bg-[#C28C88]/10 h-7 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleViewAsUser(user)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <div className="relative">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-500 hover:text-white h-7 w-7 p-0"
                            onClick={() =>
                              setActionDropdownUserId(
                                actionDropdownUserId === user.id ? null : user.id
                              )
                            }
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>

                          {actionDropdownUserId === user.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setActionDropdownUserId(null)}
                              />
                              <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-white/10 rounded-lg shadow-2xl py-1 z-50">
                                <button
                                  onClick={() => setSelectedChurchId(user.church.id)}
                                  className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/5 flex items-center gap-2"
                                >
                                  <FileText className="h-3.5 w-3.5 text-gray-500" />
                                  View Details
                                </button>
                                <button
                                  onClick={() => handleViewAsUser(user)}
                                  className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/5 flex items-center gap-2"
                                >
                                  <Eye className="h-3.5 w-3.5 text-gray-500" />
                                  Login as User
                                </button>
                                <button
                                  onClick={() => {
                                    setUpgradeModalUser(user);
                                    setSelectedTier(user.church.subscriptionTier);
                                    setActionDropdownUserId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/5 flex items-center gap-2"
                                >
                                  <ArrowUpCircle className="h-3.5 w-3.5 text-blue-400" />
                                  Change Tier
                                </button>
                                {user.church.onboardingCompleted ? (
                                  <button
                                    onClick={() => handleResetOnboarding(user)}
                                    className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/5 flex items-center gap-2"
                                    disabled={actionLoading}
                                  >
                                    <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                                    Reset Onboarding
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleCompleteOnboarding(user)}
                                    className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/5 flex items-center gap-2"
                                    disabled={actionLoading}
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                                    Complete Onboarding
                                  </button>
                                )}
                                <hr className="my-1 border-white/5" />
                                <button
                                  onClick={() => handleDeleteUser(user)}
                                  className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                  disabled={actionLoading}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete Account
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-16">
              <Search className="h-8 w-8 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400 font-medium text-sm">No churches found</p>
              <p className="text-gray-600 text-xs mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>

      {/* Church Detail Slide-Over */}
      {selectedChurchId && (
        <ChurchDetailPanel
          churchId={selectedChurchId}
          onClose={() => setSelectedChurchId(null)}
          onViewAsUser={(u) => {
            setSelectedChurchId(null);
            handleViewAsUser(u);
          }}
          onChangeTier={(u) => {
            setSelectedChurchId(null);
            setUpgradeModalUser(u);
            setSelectedTier(u.church.subscriptionTier);
          }}
          onResetOnboarding={(u) => {
            handleResetOnboarding(u);
            setSelectedChurchId(null);
          }}
          onCompleteOnboarding={(u) => {
            handleCompleteOnboarding(u);
            setSelectedChurchId(null);
          }}
          onDeleteUser={(u) => {
            handleDeleteUser(u);
          }}
          users={users}
        />
      )}

      {/* Upgrade / Change Tier Modal */}
      <Modal
        isOpen={!!upgradeModalUser}
        onClose={() => {
          setUpgradeModalUser(null);
          setSelectedTier('');
        }}
        title={`Change Tier - ${upgradeModalUser?.church?.name}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Current tier: <TierBadge tier={upgradeModalUser?.church?.subscriptionTier || 'free'} />
          </p>

          <Select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            options={[
              { value: 'free', label: 'Free (SMS via Twilio)' },
              { value: 'blue_shared', label: 'Blue Shared (iMessage/RCS)' },
              { value: 'blue_dedicated', label: 'Blue Dedicated (iMessage/RCS + Priority)' },
            ]}
          />

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setUpgradeModalUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpgrade} disabled={actionLoading || !selectedTier}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Update Tier
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="h-8 w-8 border-2 border-[#C28C88] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminPageContent />
    </Suspense>
  );
}
