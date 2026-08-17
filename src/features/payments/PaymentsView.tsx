import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, Calendar, CheckCircle } from 'lucide-react';
import type { Payment, BusinessDocument, Client, PaymentMethod } from '../../types';
import { PaymentRepository } from '../../lib/repositories/paymentRepository';
import { formatCurrency, formatDate } from '../../lib/formatting/formatters';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmModal } from '../../components/ConfirmModal';

interface PaymentsViewProps {
  payments: Payment[];
  documents: BusinessDocument[];
  clients: Client[];
  initialDocumentForPayment?: BusinessDocument | null;
  onRefresh: () => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  documents,
  clients,
  initialDocumentForPayment,
  onRefresh
}) => {
  const [isModalOpen, setIsModalOpen] = useState(!!initialDocumentForPayment);
  const [selectedDocId, setSelectedDocId] = useState(initialDocumentForPayment?.id || '');
  const [amount, setAmount] = useState<number>(initialDocumentForPayment?.balanceDue || 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || 'Client';
  const getDocNumber = (docId: string) => documents.find(d => d.id === docId)?.number || 'Document';

  const handleOpenAdd = () => {
    setSelectedDocId(documents[0]?.id || '');
    setAmount(documents[0]?.balanceDue || 0);
    setPaymentMethod('Bank Transfer');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setReferenceNumber('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleDocSelectChange = (docId: string) => {
    setSelectedDocId(docId);
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      setAmount(doc.balanceDue);
    }
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const doc = documents.find(d => d.id === selectedDocId);
    if (!doc || amount <= 0) return;

    await PaymentRepository.recordPayment({
      clientId: doc.clientId,
      documentId: doc.id,
      paymentDate,
      amount,
      paymentMethod,
      referenceNumber,
      notes
    });

    setIsModalOpen(false);
    onRefresh();
  };

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      await PaymentRepository.delete(deletingId);
      setDeletingId(null);
      onRefresh();
    }
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Payment Records & Balance</h3>
          <p style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>
            Track client payments, partial payments and outstanding balances.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn-primary">
          <Plus size={16} />
          <span>Record New Payment</span>
        </button>
      </div>

      {payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments recorded yet"
          description="Record payments received from clients against issued invoices to automatically update outstanding balances."
          actionLabel="+ Record First Payment"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--secondary-text)', fontWeight: 600 }}>
                <th style={{ padding: '12px 16px' }}>Date</th>
                <th style={{ padding: '12px 16px' }}>Document #</th>
                <th style={{ padding: '12px 16px' }}>Client</th>
                <th style={{ padding: '12px 16px' }}>Method</th>
                <th style={{ padding: '12px 16px' }}>Ref / Txn #</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Amount Paid</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--secondary-text)' }}>
                    {formatDate(p.paymentDate)}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--primary-purple)' }}>
                    {getDocNumber(p.documentId)}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                    {getClientName(p.clientId)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="badge badge-purple">{p.paymentMethod}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>
                    {p.referenceNumber || '-'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: 'var(--success)' }}>
                    {formatCurrency(p.amount)}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <button onClick={() => setDeletingId(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={handleRecordPaymentSubmit} className="card fade-in" style={{ width: '480px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Record Payment Received</h3>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Against Document *</label>
              <select
                value={selectedDocId}
                onChange={e => handleDocSelectChange(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }}
              >
                {documents.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.number} - {getClientName(d.clientId)} (Bal: ₹{d.balanceDue.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Amount Received (₹) *</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }}
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Payment Date</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Reference / UTR / Txn #</label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={e => setReferenceNumber(e.target.value)}
                  placeholder="e.g. UTR12345678"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Record Payment</button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Delete Payment Record"
        message="Are you sure you want to delete this payment record? The document balance will be automatically recalculated."
        confirmText="Delete"
        isDanger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
