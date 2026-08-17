import React from 'react';
import { LayoutTemplate, CheckCircle2 } from 'lucide-react';

export const TemplatesView: React.FC = () => {
  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Document Templates</h2>
        <p style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>
          Manage visual document design systems for your business PDF and DOCX outputs.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Modern Purple Template Card */}
        <div className="card" style={{ border: '2px solid var(--primary-purple)', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary-purple)' }}>MODERN PURPLE</h3>
            <span className="badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={12} /> ACTIVE DEFAULT
            </span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--secondary-text)', lineHeight: 1.5, marginBottom: '16px' }}>
            Inspired by the reference quotation layout. Clean white A4 page canvas, Royal Purple header `#6D28D9`, soft lavender summary box, structured item tables, bank/UPI section, and signature block.
          </p>

          <div style={{ height: '140px', backgroundColor: 'var(--light-purple)', borderRadius: '6px', border: '1px solid #DDD6FE', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 800, fontSize: '12px', color: 'var(--primary-purple)' }}>Debashish Tech</div>
              <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--primary-purple)' }}>QUOTATION</div>
            </div>

            <div style={{ height: '24px', backgroundColor: 'var(--primary-purple)', borderRadius: '3px', color: 'white', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', padding: '0 8px' }}>
              ITEMS & SERVICES TABLE
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ backgroundColor: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 800, color: 'var(--primary-purple)' }}>
                TOTAL: ₹1,17,500
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
