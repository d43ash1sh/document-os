import React, { useState } from 'react';
import { Users, Plus, Search, Edit2, Trash2, Mail, Phone, MapPin, Building, FileText, CreditCard } from 'lucide-react';
import type { Client, BusinessDocument, Payment } from '../../types';
import { ClientRepository } from '../../lib/repositories/clientRepository';
import { formatCurrency, formatDate } from '../../lib/formatting/formatters';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmModal } from '../../components/ConfirmModal';

interface ClientsViewProps {
  clients: Client[];
  documents: BusinessDocument[];
  payments: Payment[];
  onRefresh: () => void;
  onSelectClientDocs: (clientId: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  documents,
  payments,
  onRefresh,
  onSelectClientDocs
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedClientProfile, setSelectedClientProfile] = useState<Client | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    contactPerson: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pinCode: '',
    gstin: '',
    pan: '',
    taxType: 'GST_INTRA' as any,
    notes: ''
  });

  const handleOpenAdd = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      organization: '',
      contactPerson: '',
      phone: '',
      email: '',
      website: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      pinCode: '',
      gstin: '',
      pan: '',
      taxType: 'GST_INTRA',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Client) => {
    setEditingClient(c);
    setFormData({
      name: c.name,
      organization: c.organization || '',
      contactPerson: c.contactPerson || '',
      phone: c.phone || '',
      email: c.email || '',
      website: c.website || '',
      address: c.address || '',
      city: c.city || '',
      state: c.state || '',
      country: c.country || 'India',
      pinCode: c.pinCode || '',
      gstin: c.gstin || '',
      pan: c.pan || '',
      taxType: c.taxType || 'GST_INTRA',
      notes: c.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingClient) {
      await ClientRepository.update(editingClient.id, formData);
    } else {
      await ClientRepository.create(formData);
    }
    setIsModalOpen(false);
    onRefresh();
  };

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      await ClientRepository.delete(deletingId);
      setDeletingId(null);
      if (selectedClientProfile?.id === deletingId) setSelectedClientProfile(null);
      onRefresh();
    }
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Client Financial Breakdown
  const getClientTotals = (clientId: string) => {
    const clientDocs = documents.filter(d => d.clientId === clientId);
    const totalQuoted = clientDocs.filter(d => d.type === 'quotation').reduce((s, d) => s + d.grandTotal, 0);
    const totalInvoiced = clientDocs.filter(d => d.type === 'invoice').reduce((s, d) => s + d.grandTotal, 0);
    const totalPaid = clientDocs.reduce((s, d) => s + d.amountPaid, 0);
    const totalOutstanding = clientDocs.reduce((s, d) => s + d.balanceDue, 0);

    return { totalQuoted, totalInvoiced, totalPaid, totalOutstanding, docCount: clientDocs.length };
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
          <Search size={16} color="var(--secondary-text)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13px' }}
          />
        </div>

        <button onClick={handleOpenAdd} className="btn-primary" style={{ padding: '8px 14px', fontSize: '13px' }}>
          <Plus size={15} />
          <span>+ Add Client</span>
        </button>
      </div>

      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients yet"
          description="Create your first client profile to attach quotations, invoices and track financial balances."
          actionLabel="+ Add First Client"
          onAction={handleOpenAdd}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Clients List Table */}
          <div className="card responsive-table" style={{ padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '600px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--secondary-text)', fontWeight: 600 }}>
                  <th style={{ padding: '12px 16px' }}>Client Name</th>
                  <th style={{ padding: '12px 16px' }}>Organization</th>
                  <th style={{ padding: '12px 16px' }}>Contact Info</th>
                  <th style={{ padding: '12px 16px' }}>GSTIN</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Outstanding</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map(c => {
                  const totals = getClientTotals(c.id);
                  const isSelected = selectedClientProfile?.id === c.id;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedClientProfile(c)}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: isSelected ? 'var(--light-purple)' : 'transparent',
                        cursor: 'pointer'
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--primary-purple)' }}>
                        {c.name}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--dark-text)' }}>
                        {c.organization || '-'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: '12px' }}>{c.email}</div>
                        <div style={{ fontSize: '11px', color: 'var(--secondary-text)' }}>{c.phone}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px' }}>
                        {c.gstin || '-'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: totals.totalOutstanding > 0 ? 'var(--warning)' : 'var(--success)' }}>
                        {formatCurrency(totals.totalOutstanding)}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button onClick={() => handleOpenEdit(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary-text)' }}>
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => setDeletingId(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Client Details Profile Panel */}
          {selectedClientProfile && (
            <div className="card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Client Profile</h3>
                <button onClick={() => setSelectedClientProfile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--secondary-text)' }}>Close</button>
              </div>

              <div>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-purple)' }}>{selectedClientProfile.name}</h4>
                {selectedClientProfile.organization && <div style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>{selectedClientProfile.organization}</div>}
              </div>

              <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div><Mail size={14} style={{ display: 'inline', marginRight: '6px' }} /> {selectedClientProfile.email || 'No email'}</div>
                <div><Phone size={14} style={{ display: 'inline', marginRight: '6px' }} /> {selectedClientProfile.phone || 'No phone'}</div>
                <div><MapPin size={14} style={{ display: 'inline', marginRight: '6px' }} /> {selectedClientProfile.address}, {selectedClientProfile.city} {selectedClientProfile.pinCode}</div>
                {selectedClientProfile.gstin && <div><strong>GSTIN:</strong> {selectedClientProfile.gstin}</div>}
              </div>

              {/* Financial summary for selected client */}
              {(() => {
                const totals = getClientTotals(selectedClientProfile.id);
                return (
                  <div style={{ backgroundColor: 'var(--light-purple)', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--primary-purple)' }}>FINANCIAL SUMMARY</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span>Total Quoted:</span>
                      <strong>{formatCurrency(totals.totalQuoted)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span>Total Invoiced:</span>
                      <strong>{formatCurrency(totals.totalInvoiced)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span>Total Paid:</span>
                      <strong style={{ color: 'var(--success)' }}>{formatCurrency(totals.totalPaid)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid #DDD6FE', paddingTop: '6px' }}>
                      <span>Outstanding Balance:</span>
                      <strong style={{ color: 'var(--danger)' }}>{formatCurrency(totals.totalOutstanding)}</strong>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={handleSave} className="card fade-in" style={{ width: '560px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{editingClient ? 'Edit Client' : 'Add New Client'}</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Client Name *</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Organization / School</label>
                <input type="text" value={formData.organization} onChange={e => setFormData({ ...formData, organization: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Phone</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Address</label>
              <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>City</label>
                <input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>State</label>
                <input type="text" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>PIN Code</label>
                <input type="text" value={formData.pinCode} onChange={e => setFormData({ ...formData, pinCode: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>GSTIN</label>
                <input type="text" value={formData.gstin} onChange={e => setFormData({ ...formData, gstin: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>GST Type</label>
                <select value={formData.taxType} onChange={e => setFormData({ ...formData, taxType: e.target.value as any })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}>
                  <option value="GST_INTRA">Intra-State (CGST + SGST)</option>
                  <option value="GST_INTER">Inter-State (IGST)</option>
                  <option value="EXEMPT">Exempt / No Tax</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Save Client</button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Delete Client"
        message="Are you sure you want to delete this client? Associated historical documents will be retained."
        confirmText="Delete"
        isDanger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
