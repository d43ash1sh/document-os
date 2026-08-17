import React from 'react';
import { 
  Users, 
  FileText, 
  Receipt, 
  Clock, 
  TrendingUp, 
  Plus, 
  CreditCard,
  Eye,
  Download,
  Copy,
  Edit
} from 'lucide-react';
import type { BusinessDocument, Client } from '../../types';
import { formatCurrency, formatDate } from '../../lib/formatting/formatters';
import { EmptyState } from '../../components/EmptyState';

interface DashboardViewProps {
  documents: BusinessDocument[];
  clients: Client[];
  onNewQuotation: () => void;
  onNewInvoice: () => void;
  onNewClient: () => void;
  onViewDocument: (doc: BusinessDocument) => void;
  onEditDocument: (doc: BusinessDocument) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  documents,
  clients,
  onNewQuotation,
  onNewInvoice,
  onNewClient,
  onViewDocument,
  onEditDocument
}) => {
  // Compute KPIs purely from actual stored data
  const totalClients = clients.length;
  const totalQuotations = documents.filter(d => d.type === 'quotation').length;
  const totalInvoices = documents.filter(d => d.type === 'invoice').length;
  const totalOutstanding = documents.reduce((sum, d) => sum + d.balanceDue, 0);
  const totalRevenue = documents.reduce((sum, d) => sum + d.amountPaid, 0);

  const getClientName = (clientId: string) => {
    const found = clients.find(c => c.id === clientId);
    return found ? found.name : 'Unknown Client';
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner / Welcome */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--dark-text)' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--secondary-text)', marginTop: '2px' }}>
            Here's your business document & revenue overview.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={onNewQuotation} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '13px' }}>
            <FileText size={15} color="var(--primary-purple)" />
            <span>+ Quotation</span>
          </button>
          <button onClick={onNewInvoice} className="btn-primary" style={{ padding: '8px 12px', fontSize: '13px' }}>
            <Receipt size={15} />
            <span>+ Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--secondary-text)' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Total Clients</span>
            <Users size={18} color="var(--primary-purple)" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px', color: 'var(--dark-text)' }}>
            {totalClients}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--secondary-text)' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Quotations</span>
            <FileText size={18} color="var(--primary-purple)" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px', color: 'var(--dark-text)' }}>
            {totalQuotations}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--secondary-text)' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Invoices</span>
            <Receipt size={18} color="var(--primary-purple)" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px', color: 'var(--dark-text)' }}>
            {totalInvoices}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--secondary-text)' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Total Revenue Paid</span>
            <TrendingUp size={18} color="var(--success)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px', color: 'var(--success)' }}>
            {formatCurrency(totalRevenue)}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--secondary-text)' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Outstanding Balance</span>
            <Clock size={18} color="var(--warning)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px', color: 'var(--warning)' }}>
            {formatCurrency(totalOutstanding)}
          </div>
        </div>
      </div>

      {/* Recent Documents Section */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Recent Documents</h3>
          <span style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>Showing up to 10 latest documents</span>
        </div>

        {documents.length === 0 ? (
          <EmptyState
            title="No documents yet"
            description="Create your first quotation or invoice to start tracking your business."
            actionLabel="+ Create First Document"
            onAction={onNewQuotation}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--secondary-text)', fontWeight: 600 }}>
                  <th style={{ padding: '12px 16px' }}>Doc #</th>
                  <th style={{ padding: '12px 16px' }}>Type</th>
                  <th style={{ padding: '12px 16px' }}>Client</th>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.slice(0, 10).map(doc => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--primary-purple)' }}>
                      {doc.number}
                    </td>
                    <td style={{ padding: '12px 16px', textTransform: 'capitalize' }}>
                      {doc.type.replace('_', ' ')}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                      {getClientName(doc.clientId)}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--secondary-text)' }}>
                      {formatDate(doc.issueDate)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700 }}>
                      {formatCurrency(doc.grandTotal)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${
                        doc.status === 'paid' || doc.status === 'accepted' ? 'badge-success' :
                        doc.status === 'partially_paid' || doc.status === 'sent' ? 'badge-warning' : 'badge-purple'
                      }`}>
                        {doc.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button
                          onClick={() => onViewDocument(doc)}
                          title="View / Preview"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-purple)' }}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => onEditDocument(doc)}
                          title="Edit Document"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary-text)' }}
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
