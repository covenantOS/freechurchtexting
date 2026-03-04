'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useAdmin } from '@/lib/admin-context';
import { toast } from 'sonner';
import {
  Users,
  Building2,
  MessageSquare,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Crown,
  Sparkles,
  Phone,
  Calendar,
  Shield,
  ChevronDown,
  X,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Trash2,
  ArrowUpCircle,
  RotateCcw,
  MoreHorizontal,
  Loader2,
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

export default function AdminPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setImpersonatedUser, clearImpersonation, isImpersonating, impersonatedUser } = useAdmin();
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
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

  // Handle viewing as another user - this sets the context and navigates to their dashboard
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
    setAccountDropdownOpen(false);
    // Defer navigation to let state settle before route change
    setTimeout(() => router.push('/dashboard'), 50);
  };

  const handleExitViewMode = () => {
    clearImpersonation();
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.church.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!(session?.user as any)?.isSuperAdmin) {
    return null;
  }

  const stats = {
    totalUsers: users.length,
    freeUsers: users.filter(u => u.church.subscriptionTier === 'free').length,
    blueUsers: users.filter(u => u.church.subscriptionTier.startsWith('blue')).length,
    totalContacts: users.reduce((sum, u) => sum + u.stats.contactCount, 0),
    totalMessages: users.reduce((sum, u) => sum + u.stats.messageCount, 0),
  };

  // Separate demo and live accounts
  const demoAccounts = users.filter(u => u.email.includes('demo-') || u.email.includes('demo@'));
  const liveAccounts = users.filter(u => !u.email.includes('demo-') && !u.email.includes('demo@'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Admin Header */}
      <header className="bg-red-600 text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Shield className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold">Super Admin Panel</h1>
              <p className="text-red-200 text-sm">Free Church Texting Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isImpersonating && impersonatedUser && (
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                <Eye className="h-4 w-4" />
                <span className="text-sm">Viewing: {impersonatedUser.churchName}</span>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 h-6 px-2" onClick={handleExitViewMode}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            <span className="text-red-200 text-sm">{session?.user?.email}</span>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-6">
      <div className="space-y-6 animate-fade-in">
        {/* Quick Actions */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative">
            <button
              onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
              className="flex items-center gap-3 px-5 py-3 bg-white border border-gray-200 rounded-xl hover:border-red-300 transition-colors shadow-sm"
            >
              <Eye className="h-5 w-5 text-red-600" />
              <span className="font-medium text-gray-900">Quick View Account</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {accountDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setAccountDropdownOpen(false)} />
                <div className="absolute left-0 top-full mt-2 w-96 bg-white rounded-xl border border-gray-200 shadow-xl py-2 z-50 max-h-[500px] overflow-y-auto">
                  {/* Demo Accounts */}
                  {demoAccounts.length > 0 && (
                    <>
                      <p className="px-4 py-2 text-xs font-bold text-amber-600 uppercase tracking-wider bg-amber-50">Demo Accounts</p>
                      {demoAccounts.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleViewAsUser(user)}
                          className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-50"
                        >
                          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-amber-600">
                              {user.church.name[0]}
                            </span>
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-medium text-gray-900">{user.church.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {getTierBadge(user.church.subscriptionTier)}
                              <span className="text-xs text-gray-400">{user.stats.contactCount} contacts</span>
                            </div>
                          </div>
                          <LayoutDashboard className="h-5 w-5 text-gray-400" />
                        </button>
                      ))}
                    </>
                  )}
                  
                  {/* Live Accounts */}
                  {liveAccounts.length > 0 && (
                    <>
                      <p className="px-4 py-2 text-xs font-bold text-brand-600 uppercase tracking-wider bg-brand-50">Live Accounts</p>
                      {liveAccounts.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleViewAsUser(user)}
                          className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-50"
                        >
                          <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-brand-600">
                              {user.church.name[0]}
                            </span>
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-medium text-gray-900">{user.church.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {getTierBadge(user.church.subscriptionTier)}
                              <span className="text-xs text-gray-400">{user.stats.contactCount} contacts</span>
                            </div>
                          </div>
                          <LayoutDashboard className="h-5 w-5 text-gray-400" />
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-brand-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-xs text-gray-500">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.freeUsers}</p>
                  <p className="text-xs text-gray-500">Free Tier</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.blueUsers}</p>
                  <p className="text-xs text-gray-500">Blue Tier</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalContacts.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Total Contacts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalMessages.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Total Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Accounts</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users or churches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Church / User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Tier</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Provider</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Contacts</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Messages</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Created</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{user.church.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          {user.isSuperAdmin && (
                            <Badge variant="destructive" className="mt-1">Super Admin</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">{getTierBadge(user.church.subscriptionTier)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {user.church.subscriptionTier.startsWith('blue') ? (
                            <Badge className="bg-blue-100 text-blue-700">iMessage/RCS</Badge>
                          ) : (
                            <Badge variant="outline">{user.church.provider || 'Not Set'}</Badge>
                          )}
                          {user.church.providerPhoneNumber && (
                            <span className="text-xs text-gray-400">
                              <Phone className="h-3 w-3 inline" /> {user.church.providerPhoneNumber}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{user.stats.contactCount}</td>
                      <td className="py-3 px-4 text-sm">{user.stats.messageCount}</td>
                      <td className="py-3 px-4">
                        {user.church.onboardingCompleted ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle2 className="h-4 w-4" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-600 text-sm">
                            <XCircle className="h-4 w-4" /> Onboarding
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                            onClick={() => handleViewAsUser(user)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View As
                          </Button>
                          
                          {/* Actions Dropdown */}
                          {!user.isSuperAdmin && (
                            <div className="relative">
                              <Button
                                size="sm"
                                variant="ghost"
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
                No users found matching your search.
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
