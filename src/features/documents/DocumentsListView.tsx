import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Eye, 
  Edit2, 
  Copy, 
  RefreshCw, 
  Download, 
  Trash2, 
  CreditCard, 
  CheckCircle,
  Filter
} from 'lucide-react';
import type { BusinessDocument, DocumentType, Client, BusinessProfile, PaymentSettings } from '../../types';
import { DocumentRepository } from '../../lib/repositories/documentRepository';
import { formatCurrency, formatDate } from '../../lib/formatting/formatters';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmModal } from '../../components/ConfirmModal';
import { generateDocumentPDF } from '../../lib/document-engine/pdfGenerator';
import { generateDocumentDOCX } from '../../lib/document-engine/docxGenerator';

interface DocumentsListViewProps {
  documents: BusinessDocument[];
  clients: Client[];
  businessProfile: BusinessProfile;
  paymentSettings: PaymentSettings;
  filterType?: string;
  onNewDocument: (type: DocumentType) => void;
  onEditDocument: (doc: BusinessDocument) => void;
  onRecordPayment: (doc: BusinessDocument) => void;
  onRefresh: () => void;
}

export const DocumentsListView: React.FC<DocumentsListViewProps> = ({
  documents,
  clients,
  businessProfile,
  paymentSettings,
  filterType = 'all',
  onNewDocument,
  onEditDocument,
  onRecordPayment,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getClientName = (clientId: string) => {
    const found = clients.find(c => c.id === clientId);
    return found ? found.name : 'Unknown Client';
  };

  const handleDuplicate = async (doc: BusinessDocument) => {
    await DocumentRepository.duplicate(doc.id);
    onRefresh();
  };

  const handleConvert = async (doc: BusinessDocument, targetType: DocumentType) => {
    await DocumentRepository.convert(doc.id, targetType);
    onRefresh();
  };

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      await DocumentRepository.delete(deletingId);
      setDeletingId(null);
      onRefresh();
    }
  };

  const handleDownloadPDF = async (doc: BusinessDocument) => {
    const client = clients.find(c => c.id === doc.clientId);
    // Create temporary offscreen preview if needed or trigger generator directly
    await generateDocumentPDF('document-a4-preview', doc, client);
  };

  const handleDownloadDOCX = async (doc: BusinessDocument) => {
    const client = clients.find(c => c.id === doc.clientId);
    await generateDocumentDOCX(doc, client, businessProfile, paymentSettings);
  };

  const filteredDocs = documents.filter(d => {
    const matchesType = filterType === 'all' || d.type === filterType;
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    const clientName = getClientName(d.clientId).toLowerCase();
    const matchesSearch = d.number.toLowerCase().includes(searchTerm.toLowerCase()) || clientName.includes(searchTerm.toLowerCase());

    return matchesType && matchesStatus && matchesSearch;
  });

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="var(--secondary-text)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search doc # or client..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13px' }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13px', backgroundColor: 'white' }}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="issued">Issued</option>
            <option value="accepted">Accepted</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <button onClick={() => onNewDocument((filterType === 'all' ? 'quotation' : filterType) as DocumentType)} className="btn-primary">
          <Plus size={16} />
          <span>Create New {filterType === 'all' ? 'Document' : filterType.replace('_', ' ')}</span>
        </button>
      </div>

      {filteredDocs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={`No ${filterType === 'all' ? 'documents' : filterType.replace('_', ' ')} created yet`}
          description="Create your first document to preview, print, export to PDF/DOCX and track payment status."
          actionLabel={`+ Create ${filterType === 'all' ? 'Document' : filterType.replace('_', ' ')}`}
          onAction={() => onNewDocument((filterType === 'all' ? 'quotation' : filterType) as DocumentType)}
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--secondary-text)', fontWeight: 600 }}>
                <th style={{ padding: '12px 16px' }}>Doc Number</th>
                <th style={{ padding: '12px 16px' }}>Type</th>
                <th style={{ padding: '12px 16px' }}>Client</th>
                <th style={{ padding: '12px 16px' }}>Issue Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total Amount</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Balance Due</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map(doc => (
                <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--primary-purple)' }}>
                    {doc.number} {doc.revision > 1 && <span style={{ fontSize: '10px', color: 'var(--secondary-text)' }}>(Rev {doc.revision})</span>}
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
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: doc.balanceDue > 0 ? 'var(--danger)' : 'var(--success)' }}>
                    {formatCurrency(doc.balanceDue)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge ${
                      doc.paymentStatus === 'paid' || doc.status === 'accepted' ? 'badge-success' :
                      doc.paymentStatus === 'partially_paid' ? 'badge-warning' : 'badge-purple'
                    }`}>
                      {doc.paymentStatus === 'paid' ? 'Paid' : doc.paymentStatus === 'partially_paid' ? 'Partial' : doc.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button onClick={() => onEditDocument(doc)} title="Edit Document" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-purple)' }}>
                        <Edit2 size={15} />
                      </button>

                      <button onClick={() => handleDuplicate(doc)} title="Duplicate Document" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary-text)' }}>
                        <Copy size={15} />
                      </button>

                      {doc.type === 'quotation' && (
                        <button onClick={() => handleConvert(doc, 'invoice')} title="Convert to Invoice" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--success)' }}>
                          <RefreshCw size={15} />
                        </button>
                      )}

                      {doc.balanceDue > 0 && (
                        <button onClick={() => onRecordPayment(doc)} title="Record Payment" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--warning)' }}>
                          <CreditCard size={15} />
                        </button>
                      )}

                      <button onClick={() => handleDownloadDOCX(doc)} title="Download DOCX" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary-text)' }}>
                        <Download size={15} />
                      </button>

                      <button onClick={() => setDeletingId(doc.id)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
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

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        confirmText="Delete"
        isDanger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
