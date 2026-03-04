'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdmin } from '@/lib/admin-context';
import {
  Users,
  MessageSquare,
  TrendingUp,
  Shield,
  Send,
  UserPlus,
  Upload,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Apple,
} from 'lucide-react';

interface Stats {
  totalContacts: number;
  messagesSentThisMonth: number;
  deliveryRate: number;
  a2pStatus: string;
}

export default function DashboardPage() {
  const { data: session } = useSession() || {};
  const { isImpersonating, impersonatedUser, effectiveSubscriptionTier, effectiveChurchId, adminFetch } = useAdmin();
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Get effective values based on impersonation
  const effectiveName = isImpersonating ? impersonatedUser?.name : session?.user?.name;
  const effectiveChurchName = isImpersonating ? impersonatedUser?.churchName : (session?.user as any)?.churchName;
  const isBlue = effectiveSubscriptionTier === 'blue_shared' || effectiveSubscriptionTier === 'blue_dedicated';

  // Refetch when church context changes (admin impersonation)
  React.useEffect(() => {
    setStats(null);
    setLoading(true);
    fetchStats();
  }, [effectiveChurchId]);

  const fetchStats = async () => {
    try {
      const res = await adminFetch('/api/dashboard/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getA2PStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' }> = {
      not_started: { label: 'Not Started', variant: 'warning' },
      brand_submitted: { label: 'Brand Submitted', variant: 'default' },
      brand_approved: { label: 'Brand Approved', variant: 'default' },
      campaign_submitted: { label: 'Campaign Submitted', variant: 'default' },
      campaign_approved: { label: 'Campaign Approved', variant: 'success' },
      fully_approved: { label: 'Fully Approved', variant: 'success' },
      rejected: { label: 'Rejected', variant: 'destructive' },
    };
    const info = statusMap[status] || { label: 'Unknown', variant: 'default' as const };
    return <Badge variant={info.variant}>{info.label}</Badge>;
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
            Welcome back{effectiveName ? `, ${effectiveName.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-gray-500 mt-1">
            Here&apos;s how {effectiveChurchName || 'your church'} is doing with texting.
          </p>
          {isBlue && (
            <Badge className="mt-2 bg-gradient-to-r from-sky-400 to-blue-500 text-white">
              <Apple className="h-3 w-3 mr-1" />
              iMessage + RCS Active
            </Badge>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Contacts</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {loading ? '-' : stats?.totalContacts?.toLocaleString?.() ?? 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Messages This Month</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {loading ? '-' : stats?.messagesSentThisMonth?.toLocaleString?.() ?? 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Delivery Rate</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {loading ? '-' : `${stats?.deliveryRate ?? 0}%`}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Only show A2P status for non-Blue users */}
          {!isBlue ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">A2P Status</p>
                    <div className="mt-2">
                      {loading ? '-' : getA2PStatusBadge(stats?.a2pStatus || 'not_started')}
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Channel</p>
                    <p className="text-xl font-bold text-gray-900 mt-1 flex items-center gap-2">
                      <Apple className="h-5 w-5 text-blue-500" />
                      iMessage + RCS
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/messages?tab=compose&type=individual">
              <Card className="cursor-pointer hover:shadow-lg transition-all group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Send className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Send a Text</p>
                    <p className="text-sm text-gray-500">Message one person</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/messages?tab=compose&type=blast">
              <Card className="cursor-pointer hover:shadow-lg transition-all group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Send a Blast</p>
                    <p className="text-sm text-gray-500">Message a group</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/contacts?action=add">
              <Card className="cursor-pointer hover:shadow-lg transition-all group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <UserPlus className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Add Contact</p>
                    <p className="text-sm text-gray-500">Add someone new</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/contacts?action=import">
              <Card className="cursor-pointer hover:shadow-lg transition-all group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                    <Upload className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Import CSV</p>
                    <p className="text-sm text-gray-500">Bulk upload contacts</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Church Posting Blue CTA - Only show for non-Blue users */}
        {!isBlue && (
          <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-0">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Upgrade to Church Posting Blue</h3>
                    <p className="text-slate-300 mt-1">
                      Get <span className="text-blue-400 font-semibold">92% reply rates</span> with iMessage + RCS. No A2P needed.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span>Unlimited texting</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span>No per-message fees</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <span className="text-blue-400 font-medium">From $249/mo</span>
                  </div>
                  <Button className="bg-gradient-to-r from-sky-400 to-blue-500 text-white hover:from-sky-500 hover:to-blue-600" size="lg" asChild>
                    <Link href="/blue">
                      Learn More
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
