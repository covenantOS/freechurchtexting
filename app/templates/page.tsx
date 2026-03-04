'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Edit2, Trash2, Copy } from 'lucide-react';
import { useAdmin } from '@/lib/admin-context';

interface Template {
  id: string;
  name: string;
  body: string;
  category: string;
}

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'event', label: 'Event' },
  { value: 'prayer', label: 'Prayer' },
  { value: 'welcome', label: 'Welcome' },
  { value: 'volunteer', label: 'Volunteer' },
];

const CATEGORY_COLORS: Record<string, string> = {
  general: '#3B82F6',
  event: '#8B5CF6',
  prayer: '#10B981',
  welcome: '#F59E0B',
  volunteer: '#EC4899',
};

export default function TemplatesPage() {
  const { adminFetch, effectiveChurchId } = useAdmin();
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [editingTemplate, setEditingTemplate] = React.useState<Template | null>(null);
  const [formData, setFormData] = React.useState({ name: '', body: '', category: 'general' });
  const [formError, setFormError] = React.useState('');
  const [formLoading, setFormLoading] = React.useState(false);

  // Refetch when church context changes (admin impersonation)
  React.useEffect(() => {
    setTemplates([]);
    setLoading(true);
    fetchTemplates();
  }, [effectiveChurchId]);

  const fetchTemplates = async () => {
    try {
      const res = await adminFetch('/api/templates');
      const data = await res.json();
      setTemplates(data?.templates || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingTemplate(null);
    setFormData({ name: '', body: '', category: 'general' });
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({ name: template?.name || '', body: template?.body || '', category: template?.category || 'general' });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const url = editingTemplate ? `/api/templates/${editingTemplate.id}` : '/api/templates';
      const method = editingTemplate ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to save template');
      }

      setShowModal(false);
      fetchTemplates();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save template');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await adminFetch(`/api/templates/${id}`, { method: 'DELETE' });
      fetchTemplates();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator?.clipboard?.writeText?.(text);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Templates</h1>
            <p className="text-gray-500 mt-1">Save and reuse your most common messages</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Create Template
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading templates...</div>
        ) : (templates?.length || 0) === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
              <p className="text-gray-500 mb-4">Create templates to save time on common messages</p>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> Create Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates?.map?.((template) => (
              <Card key={template?.id} className="hover:shadow-lg transition-all group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Badge
                        style={{
                          backgroundColor: `${CATEGORY_COLORS[template?.category] || '#3B82F6'}20`,
                          color: CATEGORY_COLORS[template?.category] || '#3B82F6',
                        }}
                      >
                        {template?.category}
                      </Badge>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(template?.body || '')}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(template)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(template?.id || '')}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{template?.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-3">{template?.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTemplate ? 'Edit Template' : 'Create Template'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{formError}</div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Template Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Sunday Reminder"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
            <Select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={CATEGORIES}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Message Body *</label>
            <Textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Hi {first_name}! ..."
              rows={5}
              required
            />
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData({ ...formData, body: formData.body + '{first_name}' })}
              >
                + first_name
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData({ ...formData, body: formData.body + '{last_name}' })}
              >
                + last_name
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={formLoading}>
              {formLoading ? 'Saving...' : editingTemplate ? 'Save Changes' : 'Create Template'}
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
