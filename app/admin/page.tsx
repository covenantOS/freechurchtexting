'use client';

import React, { Suspense, useEffect, useState, useMemo } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
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
} from 'lucide-react';

interface UserWithStats {
  id: string;
  name: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
  createdAt: string;
  church: {
    id: string;
    name: string;
    subscriptionTier: string;
    onboardingCompleted: boolean;
    provider: string;
    providerPhoneNumber: string | null;
    createdAt: string;
  };
  stats: {
    contactCount: number;
    messageCount: number;
  };
}

function AdminPageContent() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setImpersonatedUser, clearImpersonation, isImpersonating, impersonatedUser } = useAdmin();
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionDropdownUserId, setActionDropdownUserId] = useState<string | null>(null);
  const [upgradeModalUser, setUpgradeModalUser] = useState<UserWithStats | null>(null);
  const [selectedTier, setSelectedTier] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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

  // Admin actions
  const handleDeleteUser = async (user: UserWithStats) => {
    if (!confirm(`Are you sure you want to delete ${user.church.name}? This will permanently delete all their data including contacts, messages, and templates.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(`${user.church.name} has been deleted`);
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete user');
      }
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
        toast.success(`${upgradeModalUser.church.name} upgraded to ${selectedTier}`);
        fetchUsers();
        setUpgradeModalUser(null);
        setSelectedTier('');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to upgrade');
      }
    } catch (error) {
      toast.error('Failed to upgrade');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle viewing as another user
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

  // Filtered users with tier and status filters
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.church.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTier =
        tierFilter === 'all' ||
        (tierFilter === 'free' && user.church.subscriptionTier === 'free') ||
        (tierFilter === 'blue' && user.church.subscriptionTier.startsWith('blue'));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && user.church.onboardingCompleted) ||
        (statusFilter === 'onboarding' && !user.church.onboardingCompleted);

      return matchesSearch && matchesTier && matchesStatus;
    });
  }, [users, searchTerm, tierFilter, statusFilter]);

  // Recent signups (last 30 days)
  const recentSignups = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return users
      .filter((u) => new Date(u.createdAt) >= thirtyDaysAgo && !u.isSuperAdmin)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [users]);

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'blue_dedicated':
        return <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white"><Crown className="h-3 w-3 mr-1" />Blue Dedicated</Badge>;
      case 'blue_shared':
        return <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"><Sparkles className="h-3 w-3 mr-1" />Blue Shared</Badge>;
      default:
        return <Badge variant="outline">Free (SMS)</Badge>;
    }
  };

  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!(session?.user as any)?.isSuperAdmin) {
    return null;
  }

  // Exclude super admin's own account from stats
  const nonAdminUsers = users.filter(u => !u.isSuperAdmin);

  const stats = {
    totalChurches: nonAdminUsers.length,
    freeUsers: nonAdminUsers.filter(u => u.church.subscriptionTier === 'free').length,
    blueUsers: nonAdminUsers.filter(u => u.church.subscriptionTier.startsWith('blue')).length,
    totalContacts: nonAdminUsers.reduce((sum, u) => sum + u.stats.contactCount, 0),
    totalMessages: nonAdminUsers.reduce((sum, u) => sum + u.stats.messageCount, 0),
    activeUsers: nonAdminUsers.filter(u => u.church.onboardingCompleted).length,
    onboardingUsers: nonAdminUsers.filter(u => !u.church.onboardingCompleted).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-red-700 to-red-600 text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-white/10 p-2.5">
              <Shield className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Super Admin Panel</h1>
              <p className="text-red-200 text-sm">Free Church Texting Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-red-200 text-sm hidden sm:inline">{session?.user?.email}</span>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 h-8 text-xs"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="h-3.5 w-3.5 mr-1" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <Card className="bg-white/95 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalChurches}</p>
                    <p className="text-xs text-gray-500">Churches</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/95 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.freeUsers}</p>
                    <p className="text-xs text-gray-500">Free Tier</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/95 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.blueUsers}</p>
                    <p className="text-xs text-gray-500">Blue Tier</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/95 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                    <p className="text-xs text-gray-500">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/95 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.onboardingUsers}</p>
                    <p className="text-xs text-gray-500">Onboarding</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/95 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalContacts.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Contacts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/95 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalMessages.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Messages</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Signups */}
          {recentSignups.length > 0 && (
            <Card className="bg-white/95 backdrop-blur">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-base">Recent Signups (Last 30 Days)</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {recentSignups.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleViewAsUser(user)}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-red-200 hover:bg-red-50/50 transition-all text-left group"
                    >
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-brand-700">
                          {user.church.name[0]}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm truncate">{user.church.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <span className="text-xs text-gray-500">{getRelativeTime(user.createdAt)}</span>
                        </div>
                      </div>
                      <Eye className="h-4 w-4 text-gray-300 group-hover:text-red-500 transition-colors flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Churches Table */}
          <Card className="bg-white/95 backdrop-blur">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  All Churches
                  <Badge variant="outline" className="ml-2">{filteredUsers.length}</Badge>
                </CardTitle>
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Tier Filter */}
                  <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setTierFilter('all')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        tierFilter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setTierFilter('free')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        tierFilter === 'free' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Free
                    </button>
                    <button
                      onClick={() => setTierFilter('blue')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        tierFilter === 'blue' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Blue
                    </button>
                  </div>
                  {/* Status Filter */}
                  <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setStatusFilter('all')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        statusFilter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setStatusFilter('active')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        statusFilter === 'active' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setStatusFilter('onboarding')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        statusFilter === 'onboarding' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Onboarding
                    </button>
                  </div>
                  {/* Search */}
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search churches..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Church / User</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tier</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Provider</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacts</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Messages</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                        onClick={() => handleViewAsUser(user)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-brand-700">
                                {user.church.name[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{user.church.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                              {user.isSuperAdmin && (
                                <Badge variant="destructive" className="mt-0.5 text-[10px] py-0 px-1.5">Admin</Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{getTierBadge(user.church.subscriptionTier)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {user.church.subscriptionTier.startsWith('blue') ? (
                              <Badge className="bg-blue-100 text-blue-700 text-xs">iMessage/RCS</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">{user.church.provider || 'Not Set'}</Badge>
                            )}
                            {user.church.providerPhoneNumber && (
                              <span className="text-xs text-gray-400 hidden lg:inline">
                                <Phone className="h-3 w-3 inline" /> {user.church.providerPhoneNumber}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-gray-700">{user.stats.contactCount.toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-gray-700">{user.stats.messageCount.toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-4">
                          {user.church.onboardingCompleted ? (
                            <span className="inline-flex items-center gap-1 text-green-700 text-xs font-medium bg-green-50 px-2 py-1 rounded-full">
                              <CheckCircle2 className="h-3 w-3" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-700 text-xs font-medium bg-amber-50 px-2 py-1 rounded-full">
                              <Clock className="h-3 w-3" /> Onboarding
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 h-8 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleViewAsUser(user)}
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              View As
                            </Button>

                            {/* Actions Dropdown */}
                            {!user.isSuperAdmin && (
                              <div className="relative">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={() => setActionDropdownUserId(actionDropdownUserId === user.id ? null : user.id)}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>

                                {actionDropdownUserId === user.id && (
                                  <>
                                    <div className="fixed inset-0 z-40" onClick={() => setActionDropdownUserId(null)} />
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg border border-gray-200 shadow-xl py-1 z-50">
                                      <button
                                        onClick={() => {
                                          setUpgradeModalUser(user);
                                          setSelectedTier(user.church.subscriptionTier);
                                          setActionDropdownUserId(null);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                      >
                                        <ArrowUpCircle className="h-4 w-4 text-brand-500" />
                                        Change Tier
                                      </button>
                                      {user.church.onboardingCompleted ? (
                                        <button
                                          onClick={() => handleResetOnboarding(user)}
                                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                          disabled={actionLoading}
                                        >
                                          <RotateCcw className="h-4 w-4 text-amber-500" />
                                          Reset Onboarding
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => handleCompleteOnboarding(user)}
                                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                          disabled={actionLoading}
                                        >
                                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                                          Complete Onboarding
                                        </button>
                                      )}
                                      <hr className="my-1 border-gray-100" />
                                      <button
                                        onClick={() => handleDeleteUser(user)}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                                        disabled={actionLoading}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Delete Account
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No churches found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Upgrade Modal */}
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
            Current tier: <Badge>{upgradeModalUser?.church?.subscriptionTier}</Badge>
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <AdminPageContent />
    </Suspense>
  );
}
