import React, { useState } from 'react';
import { Briefcase, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import type { Service, TaxType } from '../../types';
import { ServiceRepository } from '../../lib/repositories/serviceRepository';
import { formatCurrency } from '../../lib/formatting/formatters';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmModal } from '../../components/ConfirmModal';

interface ServicesViewProps {
  services: Service[];
  onRefresh: () => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ services, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Web Development',
    defaultRate: 1000,
    unit: 'Project',
    taxRate: 18,
    taxType: 'gst' as TaxType,
    hsnSac: '998314',
    active: true,
    notes: ''
  });

  const categories = Array.from(new Set(services.map(s => s.category || 'General'))).sort();

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      category: 'Web Development',
      defaultRate: 1000,
      unit: 'Project',
      taxRate: 18,
      taxType: 'gst',
      hsnSac: '998314',
      active: true,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Service) => {
    setEditingService(s);
    setFormData({
      name: s.name,
      description: s.description || '',
      category: s.category || 'Web Development',
      defaultRate: s.defaultRate || 0,
      unit: s.unit || 'Unit',
      taxRate: s.taxRate || 0,
      taxType: s.taxType || 'none',
      hsnSac: s.hsnSac || '',
      active: s.active,
      notes: s.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingService) {
      await ServiceRepository.update(editingService.id, formData);
    } else {
      await ServiceRepository.create(formData);
    }
    setIsModalOpen(false);
    onRefresh();
  };

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      await ServiceRepository.delete(deletingId);
      setDeletingId(null);
      onRefresh();
    }
  };

  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Search & Category Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="var(--secondary-text)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13px' }}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13px', backgroundColor: 'white' }}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <button onClick={handleOpenAdd} className="btn-primary">
          <Plus size={16} />
          <span>Add New Service</span>
        </button>
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No services in catalog"
          description="Add your reusable service packages and default rates to quickly populate quotations and invoices."
          actionLabel="+ Add First Service"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--secondary-text)', fontWeight: 600 }}>
                <th style={{ padding: '12px 16px' }}>Service Name</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>HSN/SAC</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Default Rate</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>GST Rate</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary-purple)' }}>{s.name}</div>
                    {s.description && <div style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>{s.description}</div>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="badge badge-purple">{s.category || 'General'}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>{s.hsnSac || '-'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700 }}>
                    {formatCurrency(s.defaultRate)} / {s.unit}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>{s.taxRate ? `${s.taxRate}%` : '0%'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button onClick={() => handleOpenEdit(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary-text)' }}>
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => setDeletingId(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={handleSave} className="card fade-in" style={{ width: '520px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{editingService ? 'Edit Service' : 'Add New Service'}</h3>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Service Name *</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }} />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Description</label>
              <textarea rows={2} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Category</label>
                <input type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Web Development, Hosting" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Unit</label>
                <input type="text" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} placeholder="Project / Hour / Month" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Default Rate (₹)</label>
                <input type="number" value={formData.defaultRate} onChange={e => setFormData({ ...formData, defaultRate: Number(e.target.value) })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>GST Tax Rate %</label>
                <input type="number" value={formData.taxRate} onChange={e => setFormData({ ...formData, taxRate: Number(e.target.value) })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>HSN / SAC</label>
                <input type="text" value={formData.hsnSac} onChange={e => setFormData({ ...formData, hsnSac: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Save Service</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deletingId}
        title="Delete Service"
        message="Are you sure you want to remove this service from your catalog?"
        confirmText="Delete"
        isDanger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
