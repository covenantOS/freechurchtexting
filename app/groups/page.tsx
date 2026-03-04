'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Users,
  Edit2,
  Trash2,
  Heart,
  Star,
  Music,
  BookOpen,
  Baby,
  Megaphone,
  Shield,
  Crown,
  Flame,
  Sun,
  Church,
  HandHeart,
  Eye,
} from 'lucide-react';
import { useAdmin } from '@/lib/admin-context';

interface Group {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  memberCount?: number;
}

const COLORS = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#EF4444',
  '#06B6D4', '#84CC16', '#6366F1', '#F97316', '#14B8A6', '#A855F7',
];

// Icon registry with name -> component mapping
const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Users,
  Heart,
  Star,
  Music,
  BookOpen,
  Baby,
  HandHeart,
  Megaphone,
  Shield,
  Crown,
  Flame,
  Sun,
  Church,
};

const ICON_NAMES = Object.keys(ICON_MAP);

// Parse combined color|icon string
function parseColorIcon(colorField: string): { color: string; icon: string } {
  if (!colorField) return { color: '#3B82F6', icon: 'Users' };
  const parts = colorField.split('|');
  return {
    color: parts[0] || '#3B82F6',
    icon: parts[1] && ICON_MAP[parts[1]] ? parts[1] : 'Users',
  };
}

// Combine color and icon into storage string
function combineColorIcon(color: string, icon: string): string {
  if (icon === 'Users') return color; // Default icon, no need to store
  return `${color}|${icon}`;
}

function GroupIcon({ iconName, className, style }: { iconName: string; className?: string; style?: React.CSSProperties }) {
  const IconComponent = ICON_MAP[iconName] || Users;
  return <IconComponent className={className} style={style} />;
}

export default function GroupsPage() {
  const { adminFetch, effectiveChurchId } = useAdmin();
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [editingGroup, setEditingGroup] = React.useState<Group | null>(null);
  const [formData, setFormData] = React.useState({ name: '', description: '', color: COLORS[0], icon: 'Users' });
  const [formError, setFormError] = React.useState('');
  const [formLoading, setFormLoading] = React.useState(false);

  // Refetch when church context changes (admin impersonation)
  React.useEffect(() => {
    setGroups([]);
    setLoading(true);
    fetchGroups();
  }, [effectiveChurchId]);

  const fetchGroups = async () => {
    try {
      const res = await adminFetch('/api/groups');
      const data = await res.json();
      setGroups(data?.groups || []);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingGroup(null);
    setFormData({ name: '', description: '', color: COLORS[Math.floor(Math.random() * COLORS.length)], icon: 'Users' });
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (group: Group) => {
    const { color, icon } = parseColorIcon(group?.color || '');
    setEditingGroup(group);
    setFormData({
      name: group?.name || '',
      description: group?.description || '',
      color,
      icon,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const url = editingGroup ? `/api/groups/${editingGroup.id}` : '/api/groups';
      const method = editingGroup ? 'PUT' : 'POST';

      const payload = {
        name: formData.name,
        description: formData.description,
        color: combineColorIcon(formData.color, formData.icon),
      };

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to save group');
      }

      setShowModal(false);
      fetchGroups();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save group');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;

    try {
      await adminFetch(`/api/groups/${id}`, { method: 'DELETE' });
      fetchGroups();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Groups</h1>
            <p className="text-gray-500 mt-1">Organize your contacts into groups for easier messaging</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Create Group
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading groups...</div>
        ) : (groups?.length || 0) === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No groups yet</h3>
              <p className="text-gray-500 mb-4">Create your first group to organize contacts</p>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> Create Group
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups?.map?.((group) => {
              const { color, icon } = parseColorIcon(group?.color || '');
              return (
                <Card key={group?.id} className="hover:shadow-lg transition-all cursor-pointer group/card">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-12 w-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${color}20` }}
                        >
                          <GroupIcon iconName={icon} className="h-6 w-6" style={{ color }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{group?.name}</h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Users className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {group?.memberCount || 0} {(group?.memberCount || 0) === 1 ? 'member' : 'members'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(group)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(group?.id || '')}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    {group?.description && (
                      <p className="text-sm text-gray-500 mt-3 line-clamp-2">{group?.description}</p>
                    )}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <a
                        href={`/contacts?filterGroup=${group?.id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Members
                      </a>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingGroup ? 'Edit Group' : 'Create Group'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{formError}</div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Group Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Youth Ministry"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this group..."
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICON_NAMES.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: iconName })}
                  className={`h-10 w-10 rounded-lg flex items-center justify-center transition-all border-2 ${
                    formData.icon === iconName
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-transparent bg-gray-100 hover:bg-gray-200'
                  }`}
                  title={iconName}
                >
                  <GroupIcon
                    iconName={iconName}
                    className="h-5 w-5"
                    style={{ color: formData.icon === iconName ? formData.color : '#6B7280' }}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS?.map?.((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`h-8 w-8 rounded-lg transition-all ${
                    formData.color === color ? 'ring-2 ring-offset-2 ring-brand-500' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          {/* Preview */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Preview</label>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${formData.color}20` }}
              >
                <GroupIcon iconName={formData.icon} className="h-5 w-5" style={{ color: formData.color }} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{formData.name || 'Group Name'}</p>
                <p className="text-sm text-gray-500">0 members</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={formLoading}>
              {formLoading ? 'Saving...' : editingGroup ? 'Save Changes' : 'Create Group'}
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
