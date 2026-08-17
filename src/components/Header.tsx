import React from 'react';
import { Search, Plus, FileText, Receipt, UserPlus, Menu } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onOpenCommandPalette: () => void;
  onNewQuotation: () => void;
  onNewInvoice: () => void;
  onNewClient: () => void;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onOpenCommandPalette,
  onNewQuotation,
  onNewInvoice,
  onNewClient,
  onToggleMobileMenu
}) => {
  const getPageTitle = (view: string) => {
    switch (view) {
      case 'dashboard': return 'Dashboard Overview';
      case 'clients': return 'Client Database';
      case 'services': return 'Service Catalog';
      case 'documents': return 'Document Management';
      case 'payments': return 'Payments & Balance Tracking';
      case 'reports': return 'Financial Analytics';
      case 'templates': return 'Templates';
      case 'settings': return 'Settings';
      default: return 'Business Workspace';
    }
  };

  return (
    <header
      style={{
        minHeight: '64px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        gap: '12px',
        flexWrap: 'wrap'
      }}
    >
      {/* Mobile Hamburger & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onToggleMobileMenu}
          className="btn-secondary"
          style={{ padding: '6px', borderRadius: '6px' }}
        >
          <Menu size={20} color="var(--primary-purple)" />
        </button>

        <h1 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--dark-text)', margin: 0, whiteSpace: 'nowrap' }}>
          {getPageTitle(currentView)}
        </h1>
      </div>

      {/* Center Search / Command Palette Bar */}
      <button
        onClick={onOpenCommandPalette}
        style={{
          flex: 1,
          maxWidth: '300px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          backgroundColor: '#F3F4F6',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          color: 'var(--secondary-text)',
          fontSize: '13px',
          cursor: 'pointer'
        }}
      >
        <Search size={15} />
        <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Search...
        </span>
        <kbd
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '4px',
            padding: '1px 4px',
            fontSize: '10px',
            fontFamily: 'monospace'
          }}
        >
          Ctrl+K
        </kbd>
      </button>

      {/* Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button onClick={onNewQuotation} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }}>
          <FileText size={14} color="var(--primary-purple)" />
          <span>+ Quotation</span>
        </button>

        <button onClick={onNewInvoice} className="btn-primary" style={{ padding: '6px 10px', fontSize: '12px' }}>
          <Receipt size={14} />
          <span>+ Invoice</span>
        </button>
      </div>
    </header>
  );
};
