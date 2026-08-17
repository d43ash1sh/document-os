import React from 'react';
import { Search, Plus, FileText, Receipt, UserPlus, Command } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onOpenCommandPalette: () => void;
  onNewQuotation: () => void;
  onNewInvoice: () => void;
  onNewClient: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onOpenCommandPalette,
  onNewQuotation,
  onNewInvoice,
  onNewClient
}) => {
  const getPageTitle = (view: string) => {
    switch (view) {
      case 'dashboard': return 'Dashboard Overview';
      case 'clients': return 'Client Database';
      case 'services': return 'Service Catalog';
      case 'documents': return 'Document Management';
      case 'payments': return 'Payments & Balance Tracking';
      case 'reports': return 'Financial & Document Analytics';
      case 'templates': return 'Document Templates';
      case 'settings': return 'System & Business Settings';
      default: return 'Business Workspace';
    }
  };

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}
    >
      {/* Title & Breadcrumbs */}
      <div>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--dark-text)', margin: 0 }}>
          {getPageTitle(currentView)}
        </h1>
      </div>

      {/* Center Search / Command Palette Bar */}
      <button
        onClick={onOpenCommandPalette}
        style={{
          width: '320px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 14px',
          backgroundColor: '#F3F4F6',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          color: 'var(--secondary-text)',
          fontSize: '13px',
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
      >
        <Search size={16} />
        <span style={{ flex: 1, textAlign: 'left' }}>Search clients, docs, actions...</span>
        <kbd
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '4px',
            padding: '1px 6px',
            fontSize: '11px',
            fontFamily: 'monospace'
          }}
        >
          Ctrl+K
        </kbd>
      </button>

      {/* Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button onClick={onNewQuotation} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
          <FileText size={15} color="var(--primary-purple)" />
          <span>+ Quotation</span>
        </button>

        <button onClick={onNewInvoice} className="btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>
          <Receipt size={15} />
          <span>+ Invoice</span>
        </button>

        <button onClick={onNewClient} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
          <UserPlus size={15} />
          <span>+ Client</span>
        </button>
      </div>
    </header>
  );
};
