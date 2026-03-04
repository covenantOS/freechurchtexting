'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAdmin } from '@/lib/admin-context';
import {
  Search,
  UserPlus,
  Upload,
  Download,
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  Edit2,
  Trash2,
  MessageSquare,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  HelpCircle,
  History,
  Send,
  Users,
  Loader2,
} from 'lucide-react';
import { formatDisplay } from '@/lib/phone';
import { InfoTooltip } from '@/components/ui/tooltip';

interface Contact {
  id: string;
  firstName: string;
  lastName?: string | null;
  phone: string;
  email?: string | null;
  groups: string[];
  notes?: string | null;
  optInStatus: 'opted_in' | 'opted_out' | 'pending';
  createdAt: string;
}

interface Group {
  id: string;
  name: string;
  color: string;
}

interface ContactMessage {
  id: string;
  body: string;
  type: string;
  status: string;
  sentAt: string;
  senderName: string;
  isBlast: boolean;
}

export default function ContactsPage() {
  const searchParams = useSearchParams();
  const { adminFetch, effectiveChurchId } = useAdmin();
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [filterGroup, setFilterGroup] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('');

  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showImportModal, setShowImportModal] = React.useState(false);
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [selectedContact, setSelectedContact] = React.useState<Contact | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);

  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    groups: [] as string[],
    notes: '',
  });
  const [formError, setFormError] = React.useState('');
  const [formLoading, setFormLoading] = React.useState(false);
  const [detailTab, setDetailTab] = React.useState<'info' | 'history'>('info');

  // CSV Import state
  const [importFile, setImportFile] = React.useState<File | null>(null);
  const [importPreview, setImportPreview] = React.useState<Record<string, string>[]>([]);
  const [importConsent, setImportConsent] = React.useState(false);
  const [importLoading, setImportLoading] = React.useState(false);
  const [importResult, setImportResult] = React.useState<{
    imported: number;
    skipped: number;
    errors: string[];
    total: number;
  } | null>(null);
  const [importError, setImportError] = React.useState('');
  const [contactMessages, setContactMessages] = React.useState<ContactMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = React.useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const CONTACTS_PER_PAGE = 20;

  // Refetch data when church context changes (admin impersonation)
  React.useEffect(() => {
    setContacts([]);
    setGroups([]);
    setLoading(true);
    fetchContacts();
    fetchGroups();
  }, [effectiveChurchId]);
  
  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, filterGroup, filterStatus]);

  React.useEffect(() => {
    if (searchParams?.get('action') === 'add') {
      setShowAddModal(true);
    } else if (searchParams?.get('action') === 'import') {
      setShowImportModal(true);
    }
  }, [searchParams]);

  const fetchContacts = async () => {
    try {
      const res = await adminFetch('/api/contacts');
      const data = await res.json();
      setContacts(data?.contacts || []);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await adminFetch('/api/groups');
      const data = await res.json();
      setGroups(data?.groups || []);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    }
  };

  const filteredContacts = React.useMemo(() => {
    return (contacts || [])?.filter((c) => {
      // Improved search: split by spaces and match all terms
      let matchesSearch = true;
      if (search) {
        const searchTerms = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
        const contactText = `${c?.firstName || ''} ${c?.lastName || ''} ${c?.phone || ''} ${c?.email || ''}`.toLowerCase();
        matchesSearch = searchTerms.every(term => contactText.includes(term));
      }

      // Support both group IDs and group names (for legacy data)
      const contactGroups = c?.groups || [];
      const selectedGroup = groups.find(g => g.id === filterGroup);
      const matchesGroup = !filterGroup || 
        contactGroups?.includes?.(filterGroup) || 
        (selectedGroup && contactGroups?.includes?.(selectedGroup.name));
      
      const matchesStatus = !filterStatus || c?.optInStatus === filterStatus;

      return matchesSearch && matchesGroup && matchesStatus;
    });
  }, [contacts, groups, search, filterGroup, filterStatus]);
  
  // Pagination
  const totalPages = Math.ceil((filteredContacts?.length || 0) / CONTACTS_PER_PAGE);
  const paginatedContacts = React.useMemo(() => {
    const start = (currentPage - 1) * CONTACTS_PER_PAGE;
    return filteredContacts?.slice(start, start + CONTACTS_PER_PAGE) || [];
  }, [filteredContacts, currentPage]);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const res = await adminFetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to add contact');
      }

      setShowAddModal(false);
      setFormData({ firstName: '', lastName: '', phone: '', email: '', groups: [], notes: '' });
      fetchContacts();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to add contact');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact?.id) return;
    setFormError('');
    setFormLoading(true);

    try {
      const res = await adminFetch(`/api/contacts/${selectedContact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to update contact');
      }

      setIsEditing(false);
      setShowDetailModal(false);
      fetchContacts();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to update contact');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      await adminFetch(`/api/contacts/${id}`, { method: 'DELETE' });
      setShowDetailModal(false);
      fetchContacts();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const openDetail = (contact: Contact) => {
    setSelectedContact(contact);
    setFormData({
      firstName: contact?.firstName || '',
      lastName: contact?.lastName || '',
      phone: contact?.phone || '',
      email: contact?.email || '',
      groups: contact?.groups || [],
      notes: contact?.notes || '',
    });
    setIsEditing(false);
    setDetailTab('info');
    setContactMessages([]);
    setShowDetailModal(true);
  };

  const fetchContactMessages = async (contactId: string) => {
    setMessagesLoading(true);
    try {
      const res = await adminFetch(`/api/contacts/${contactId}/messages`);
      const data = await res.json();
      setContactMessages(data?.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  React.useEffect(() => {
    if (selectedContact?.id && detailTab === 'history') {
      fetchContactMessages(selectedContact.id);
    }
  }, [selectedContact?.id, detailTab]);

  const exportCSV = () => {
    const headers = ['First Name', 'Last Name', 'Phone', 'Email', 'Groups', 'Opt-In Status'];
    const rows = (contacts || [])?.map((c) => [
      c?.firstName || '',
      c?.lastName || '',
      c?.phone || '',
      c?.email || '',
      (c?.groups || [])?.join?.('; ') || '',
      c?.optInStatus || '',
    ]);

    const csv = [headers, ...rows]?.map?.((r) => r?.map?.((v) => `"${v}"`).join(','))?.join?.('\n');
    const blob = new Blob([csv || ''], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportResult(null);
    setImportError('');

    // Read and preview the CSV
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text?.trim()) {
          setImportError('CSV file is empty');
          setImportPreview([]);
          return;
        }

        const lines = text.trim().split('\n');
        if (lines.length < 2) {
          setImportError('CSV file must have a header row and at least one data row');
          setImportPreview([]);
          return;
        }

        // Simple CSV preview parser (handles basic cases)
        const parseCSVLine = (line: string): string[] => {
          const values: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim());
          return values;
        };

        const headers = parseCSVLine(lines[0]);
        const previewRows: Record<string, string>[] = [];
        const maxPreview = Math.min(lines.length, 6); // Show up to 5 data rows
        for (let i = 1; i < maxPreview; i++) {
          const values = parseCSVLine(lines[i]);
          const row: Record<string, string> = {};
          headers.forEach((h, idx) => {
            row[h.trim()] = values[idx] || '';
          });
          previewRows.push(row);
        }

        setImportPreview(previewRows);
      } catch {
        setImportError('Failed to read CSV file');
        setImportPreview([]);
      }
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = async () => {
    if (!importFile) return;

    setImportLoading(true);
    setImportError('');
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('defaultOptInStatus', importConsent ? 'opted_in' : 'pending');

      const res = await adminFetch('/api/contacts/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to import contacts');
      }

      setImportResult(data);
      fetchContacts();
    } catch (err: any) {
      setImportError(err?.message || 'Failed to import contacts');
    } finally {
      setImportLoading(false);
    }
  };

  const resetImportModal = () => {
    setImportFile(null);
    setImportPreview([]);
    setImportConsent(false);
    setImportLoading(false);
    setImportResult(null);
    setImportError('');
    // Reset the file input
    const fileInput = document.getElementById('csv-import') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const getStatusIcon = (status: string, showTooltip = false) => {
    switch (status) {
      case 'opted_in':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'opted_out':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return showTooltip ? (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-amber-500" />
            <InfoTooltip content="Contact hasn't responded yet. They will be opted-in automatically when they reply to a message, or you can manually change their status." />
          </div>
        ) : (
          <Clock className="h-4 w-4 text-amber-500" />
        );
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'opted_in':
        return 'Opted In';
      case 'opted_out':
        return 'Opted Out';
      default:
        return 'Pending';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Contacts</h1>
            <p className="text-gray-500 mt-1">Manage your congregation&apos;s contact list</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setShowImportModal(true)}>
              <Upload className="h-4 w-4" /> Import
            </Button>
            <Button variant="outline" onClick={exportCSV}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <UserPlus className="h-4 w-4" /> Add Contact
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search contacts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  icon={<Search className="h-4 w-4" />}
                />
              </div>
              <Select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                options={[{ value: '', label: 'All Groups' }, ...(groups || [])?.map?.((g) => ({ value: g?.id || '', label: g?.name || '' })) || []]}
                className="w-full sm:w-48"
              />
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'opted_in', label: 'Opted In' },
                  { value: 'opted_out', label: 'Opted Out' },
                  { value: 'pending', label: 'Pending' },
                ]}
                className="w-full sm:w-40"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contacts Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left">Name</th>
                  <th className="text-left">Phone</th>
                  <th className="text-left hidden md:table-cell">Email</th>
                  <th className="text-left hidden lg:table-cell">Groups</th>
                  <th className="text-left">Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      Loading contacts...
                    </td>
                  </tr>
                ) : (filteredContacts?.length || 0) === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      No contacts found
                    </td>
                  </tr>
                ) : (
                  paginatedContacts?.map?.((contact) => (
                    <tr
                      key={contact?.id}
                      className="cursor-pointer"
                      onClick={() => openDetail(contact)}
                    >
                      <td>
                        <div className="font-medium text-gray-900">
                          {contact?.firstName} {contact?.lastName}
                        </div>
                      </td>
                      <td className="font-mono text-sm">{formatDisplay(contact?.phone || '')}</td>
                      <td className="hidden md:table-cell text-gray-500 text-sm">{contact?.email || '-'}</td>
                      <td className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {(contact?.groups || [])?.slice?.(0, 2)?.map?.((groupIdOrName, idx) => {
                            // Support both group ID and group name (legacy data)
                            const group = groups?.find?.((g) => g?.id === groupIdOrName || g?.name === groupIdOrName);
                            return group ? (
                              <Badge
                                key={`${groupIdOrName}-${idx}`}
                                style={{ backgroundColor: `${group?.color || '#3B82F6'}20`, color: group?.color || '#3B82F6' }}
                              >
                                {group?.name}
                              </Badge>
                            ) : (
                              // Display raw name if no matching group found
                              <Badge key={`${groupIdOrName}-${idx}`} variant="secondary">
                                {groupIdOrName}
                              </Badge>
                            );
                          })}
                          {(contact?.groups?.length || 0) > 2 && (
                            <Badge variant="secondary">+{(contact?.groups?.length || 0) - 2}</Badge>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(contact?.optInStatus || 'pending')}
                          <span className="text-sm capitalize">{contact?.optInStatus?.replace?.('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(contact);
                          }}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * CONTACTS_PER_PAGE) + 1} - {Math.min(currentPage * CONTACTS_PER_PAGE, filteredContacts?.length || 0)} of {filteredContacts?.length || 0} contacts
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Add Contact Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Contact" size="md">
        <form onSubmit={handleAddContact} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{formError}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">First Name *</label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Last Name</label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Phone *</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(555) 123-4567"
              icon={<Phone className="h-4 w-4" />}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              icon={<Mail className="h-4 w-4" />}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Groups</label>
            <div className="flex flex-wrap gap-2">
              {groups?.map?.((group) => (
                <button
                  key={group?.id}
                  type="button"
                  onClick={() => {
                    const newGroups = formData?.groups?.includes?.(group?.id || '')
                      ? formData?.groups?.filter?.((g) => g !== group?.id)
                      : [...(formData?.groups || []), group?.id || ''];
                    setFormData({ ...formData, groups: newGroups });
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    formData?.groups?.includes?.(group?.id || '')
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={
                    formData?.groups?.includes?.(group?.id || '')
                      ? { backgroundColor: group?.color || '#3B82F6' }
                      : {}
                  }
                >
                  {group?.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Notes</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes about this contact..."
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={formLoading}>
              {formLoading ? 'Adding...' : 'Add Contact'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Import Modal */}
      <Modal isOpen={showImportModal} onClose={() => { setShowImportModal(false); resetImportModal(); }} title="Import Contacts" size="lg">
        <div className="space-y-4">
          {importError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
              <XCircle className="h-4 w-4 flex-shrink-0" />
              {importError}
            </div>
          )}

          {importResult ? (
            // Show results after import
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Import Complete
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{importResult.imported}</p>
                    <p className="text-xs text-gray-500">Imported</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-2xl font-bold text-amber-600">{importResult.skipped}</p>
                    <p className="text-xs text-gray-500">Skipped (duplicates)</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{importResult.errors.length}</p>
                    <p className="text-xs text-gray-500">Errors</p>
                  </div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="border border-red-200 rounded-lg overflow-hidden">
                  <div className="bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                    Errors ({importResult.errors.length})
                  </div>
                  <div className="max-h-40 overflow-y-auto p-3 space-y-1">
                    {importResult.errors.map((err, i) => (
                      <p key={i} className="text-sm text-red-600">{err}</p>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => { resetImportModal(); }}>
                  Import More
                </Button>
                <Button onClick={() => { setShowImportModal(false); resetImportModal(); }}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            // File upload and preview
            <>
              <p className="text-gray-600">Upload a CSV file with your contacts. The file should include columns for phone (required), first name, last name, email, groups, and notes.</p>

              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  importFile ? 'border-green-300 bg-green-50' : 'border-gray-200'
                }`}
              >
                {importFile ? (
                  <div className="space-y-2">
                    <FileText className="h-10 w-10 text-green-500 mx-auto" />
                    <p className="font-medium text-gray-900">{importFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(importFile.size / 1024).toFixed(1)} KB
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setImportFile(null);
                        setImportPreview([]);
                        setImportError('');
                        const fileInput = document.getElementById('csv-import') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                    >
                      <X className="h-4 w-4" /> Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">Drag and drop your CSV here, or click to browse</p>
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      id="csv-import"
                      onChange={handleImportFileChange}
                    />
                    <label htmlFor="csv-import">
                      <Button variant="secondary" className="cursor-pointer" asChild>
                        <span>Choose File</span>
                      </Button>
                    </label>
                  </>
                )}
              </div>

              {/* CSV Preview */}
              {importPreview.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
                    Preview ({importPreview.length} rows shown)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-t">
                          {Object.keys(importPreview[0]).map((header) => (
                            <th key={header} className="text-left px-3 py-1.5 font-medium text-gray-600 text-xs">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.map((row, i) => (
                          <tr key={i} className="border-t border-gray-100">
                            {Object.values(row).map((val, j) => (
                              <td key={j} className="px-3 py-1.5 text-gray-700 truncate max-w-[150px]">
                                {val || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Opt-in consent */}
              {importFile && (
                <label className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={importConsent}
                    onChange={(e) => setImportConsent(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      These contacts have given consent to receive texts
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      If checked, contacts will be imported as &quot;Opted In&quot;. Otherwise, they will be set to &quot;Pending&quot; status.
                    </p>
                  </div>
                </label>
              )}

              <div className="text-center">
                <a href="/templates/contacts-template.csv" className="text-sm text-brand-600 hover:underline">
                  Download CSV Template
                </a>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => { setShowImportModal(false); resetImportModal(); }}>
                  Cancel
                </Button>
                <Button
                  onClick={handleImportSubmit}
                  disabled={!importFile || importLoading}
                >
                  {importLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Import Contacts
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Contact Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={isEditing ? 'Edit Contact' : 'Contact Details'}
        size="lg"
      >
        {selectedContact && (
          <div className="space-y-4">
            {/* Tabs - only show when not editing */}
            {!isEditing && (
              <div className="flex border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setDetailTab('info')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    detailTab === 'info'
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Contact Info
                </button>
                <button
                  type="button"
                  onClick={() => setDetailTab('history')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
                    detailTab === 'history'
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <History className="h-4 w-4" />
                  Message History
                </button>
              </div>
            )}

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{formError}</div>
            )}

            {/* Message History Tab */}
            {detailTab === 'history' && !isEditing && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="h-12 w-12 bg-brand-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-brand-600">
                      {selectedContact?.firstName?.[0]?.toUpperCase?.()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedContact?.firstName} {selectedContact?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{formatDisplay(selectedContact?.phone || '')}</p>
                  </div>
                </div>

                <div className="border rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <h4 className="font-medium text-gray-700 text-sm">Messages ({contactMessages.length})</h4>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto p-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center py-8 text-gray-500">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Loading messages...
                      </div>
                    ) : contactMessages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p>No messages sent to this contact yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {contactMessages.map((msg) => (
                          <div key={msg.id} className="flex justify-end">
                            <div className="max-w-[80%]">
                              <div className={`px-4 py-2 rounded-2xl rounded-br-sm shadow-sm ${
                                msg.type.includes('imessage') 
                                  ? 'bg-brand-500 text-white' 
                                  : 'bg-green-500 text-white'
                              }`}>
                                <p className="text-sm">{msg.body}</p>
                              </div>
                              <div className="flex items-center justify-end gap-2 mt-1">
                                <span className="text-xs text-gray-400">
                                  {new Date(msg.sentAt).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                {msg.isBlast && (
                                  <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Users className="h-3 w-3" /> Blast
                                  </span>
                                )}
                                {msg.status === 'delivered' ? (
                                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                                ) : msg.status === 'sent' ? (
                                  <Send className="h-3 w-3 text-gray-400" />
                                ) : msg.status === 'failed' ? (
                                  <XCircle className="h-3 w-3 text-red-500" />
                                ) : (
                                  <Clock className="h-3 w-3 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDetailModal(false)}
                  >
                    Close
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <a href={`/messages?contact=${selectedContact?.id}`}>
                      <MessageSquare className="h-4 w-4" /> Send New Message
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {/* Info/Edit Tab */}
            {(detailTab === 'info' || isEditing) && (
              <form onSubmit={handleUpdateContact} className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">First Name</label>
                        <Input
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Last Name</label>
                        <Input
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Notes</label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Add any notes about this contact..."
                        rows={3}
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="h-14 w-14 bg-brand-100 rounded-full flex items-center justify-center">
                        <span className="text-xl font-semibold text-brand-600">
                          {selectedContact?.firstName?.[0]?.toUpperCase?.()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {selectedContact?.firstName} {selectedContact?.lastName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(selectedContact?.optInStatus || 'pending', selectedContact?.optInStatus === 'pending')}
                          <span className="text-sm text-gray-500 capitalize">
                            {getStatusLabel(selectedContact?.optInStatus || 'pending')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <span className="font-mono">{formatDisplay(selectedContact?.phone || '')}</span>
                      </div>
                      {selectedContact?.email && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <span>{selectedContact?.email}</span>
                        </div>
                      )}
                    </div>

                    {(selectedContact?.groups?.length || 0) > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Groups</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedContact?.groups?.map?.((groupId) => {
                            const group = groups?.find?.((g) => g?.id === groupId);
                            return group ? (
                              <Badge
                                key={groupId}
                                style={{ backgroundColor: `${group?.color || '#3B82F6'}20`, color: group?.color || '#3B82F6' }}
                              >
                                {group?.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    {selectedContact?.notes && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Notes</label>
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                          <span className="text-gray-600 whitespace-pre-wrap">{selectedContact?.notes}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleDeleteContact(selectedContact?.id || '')}
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                  <div className="flex gap-3">
                    {isEditing ? (
                      <>
                        <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={formLoading}>
                          {formLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button type="button" variant="outline" asChild>
                          <a href={`/messages?contact=${selectedContact?.id}`}>
                            <MessageSquare className="h-4 w-4" /> Send Message
                          </a>
                        </Button>
                        <Button type="button" onClick={() => setIsEditing(true)}>
                          <Edit2 className="h-4 w-4" /> Edit
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
