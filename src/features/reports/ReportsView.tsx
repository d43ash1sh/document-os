import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, FileText, CheckCircle2 } from 'lucide-react';
import type { BusinessDocument, Client, Payment } from '../../types';
import { formatCurrency } from '../../lib/formatting/formatters';

interface ReportsViewProps {
  documents: BusinessDocument[];
  clients: Client[];
  payments: Payment[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ documents, clients, payments }) => {
  const totalInvoiced = documents.filter(d => d.type === 'invoice').reduce((s, d) => s + d.grandTotal, 0);
  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);
  const totalOutstanding = documents.reduce((s, d) => s + d.balanceDue, 0);

  const totalQuotations = documents.filter(d => d.type === 'quotation').length;
  const acceptedQuotations = documents.filter(d => d.type === 'quotation' && (d.status === 'accepted' || d.status === 'converted')).length;
  const conversionRate = totalQuotations > 0 ? Math.round((acceptedQuotations / totalQuotations) * 100) : 0;

  // Breakdown by payment method
  const methodMap: Record<string, number> = {};
  payments.forEach(p => {
    methodMap[p.paymentMethod] = (methodMap[p.paymentMethod] || 0) + p.amount;
  });

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Financial & Quotation Analytics</h2>
        <p style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>
          Calculated dynamically from your actual local database.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="card">
          <div style={{ fontSize: '13px', color: 'var(--secondary-text)', fontWeight: 600 }}>Total Invoiced</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--dark-text)', marginTop: '6px' }}>
            {formatCurrency(totalInvoiced)}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '13px', color: 'var(--secondary-text)', fontWeight: 600 }}>Total Collected</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--success)', marginTop: '6px' }}>
            {formatCurrency(totalCollected)}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '13px', color: 'var(--secondary-text)', fontWeight: 600 }}>Total Outstanding</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--warning)', marginTop: '6px' }}>
            {formatCurrency(totalOutstanding)}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '13px', color: 'var(--secondary-text)', fontWeight: 600 }}>Quotation Conversion Rate</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-purple)', marginTop: '6px' }}>
            {conversionRate}%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--secondary-text)', marginTop: '4px' }}>
            {acceptedQuotations} of {totalQuotations} accepted
          </div>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Collections by Payment Method</h3>
        
        {Object.keys(methodMap).length === 0 ? (
          <div style={{ fontSize: '13px', color: 'var(--secondary-text)', fontStyle: 'italic' }}>No payment records collected yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(methodMap).map(([method, amount]) => {
              const pct = totalCollected > 0 ? Math.round((amount / totalCollected) * 100) : 0;
              return (
                <div key={method} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ fontWeight: 600 }}>{method}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '120px', height: '8px', backgroundColor: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--primary-purple)' }} />
                    </div>
                    <strong style={{ width: '100px', textAlign: 'right' }}>{formatCurrency(amount)}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
