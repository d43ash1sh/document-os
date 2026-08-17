import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  Receipt, 
  FileSpreadsheet, 
  FileCheck, 
  FilePlus, 
  ShieldCheck, 
  CreditCard, 
  BarChart3, 
  LayoutTemplate, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  FolderOpen,
  LogOut,
  X
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string, param?: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  collapsed,
  onToggleCollapse,
  onLogout,
  mobileOpen,
  onCloseMobile
}) => {
  const isNavActive = (view: string, param?: string) => {
    if (param) return currentView === view && window.location.hash.includes(param);
    return currentView === view;
  };

  const handleNavClick = (id: string, param?: string) => {
    onSelectView(id, param);
    onCloseMobile();
  };

  const navItem = (id: string, label: string, Icon: any, param?: string) => {
    const active = isNavActive(id, param);
    return (
      <button
        key={id + (param || '')}
        onClick={() => handleNavClick(id, param)}
        title={collapsed ? label : undefined}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: collapsed ? '10px 0' : '10px 14px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: active ? 'var(--light-purple)' : 'transparent',
          color: active ? 'var(--primary-purple)' : 'var(--dark-text)',
          fontWeight: active ? 600 : 400,
          fontSize: '14px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          marginBottom: '2px'
        }}
      >
        <Icon size={18} color={active ? 'var(--primary-purple)' : 'var(--secondary-text)'} />
        {(!collapsed || mobileOpen) && <span>{label}</span>}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 40
          }}
        />
      )}

      <aside
        style={{
          width: collapsed && !mobileOpen ? '68px' : '240px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: mobileOpen ? 'fixed' : 'sticky',
          top: 0,
          left: mobileOpen ? 0 : undefined,
          transform: mobileOpen ? 'none' : undefined,
          transition: 'transform 0.25s ease, width 0.2s ease',
          zIndex: 50
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary-purple)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '16px'
              }}
            >
              D
            </div>
            {(!collapsed || mobileOpen) && (
              <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--dark-text)' }}>
                Document OS
              </div>
            )}
          </div>

          {mobileOpen ? (
            <button onClick={onCloseMobile} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary-text)' }}>
              <X size={20} />
            </button>
          ) : (
            <button onClick={onToggleCollapse} style={{ background: 'none', border: 'none', color: 'var(--secondary-text)', cursor: 'pointer', padding: '4px' }}>
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          )}
        </div>

        {/* Navigation List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
          {navItem('dashboard', 'Dashboard', LayoutDashboard)}

          {(!collapsed || mobileOpen) && (
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--secondary-text)', textTransform: 'uppercase', margin: '14px 10px 4px 10px', letterSpacing: '0.5px' }}>
              Business
            </div>
          )}
          {navItem('clients', 'Clients', Users)}
          {navItem('services', 'Services', Briefcase)}

          {(!collapsed || mobileOpen) && (
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--secondary-text)', textTransform: 'uppercase', margin: '14px 10px 4px 10px', letterSpacing: '0.5px' }}>
              Documents
            </div>
          )}
          {navItem('documents', 'Quotations', FileText, 'quotation')}
          {navItem('documents', 'Invoices', Receipt, 'invoice')}
          {navItem('documents', 'Estimates', FileSpreadsheet, 'estimate')}
          {navItem('documents', 'Proforma Invoices', FileCheck, 'proforma')}
          {navItem('documents', 'Proposals', FilePlus, 'proposal')}
          {navItem('documents', 'Work Orders', FileText, 'work_order')}
          {navItem('documents', 'Receipts', Receipt, 'receipt')}
          {navItem('documents', 'Payment Receipts', CreditCard, 'payment_receipt')}
          {navItem('documents', 'AMC / Maintenance', ShieldCheck, 'amc')}
          {navItem('documents', 'All Documents', FolderOpen, 'all')}

          {(!collapsed || mobileOpen) && (
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--secondary-text)', textTransform: 'uppercase', margin: '14px 10px 4px 10px', letterSpacing: '0.5px' }}>
              Finance
            </div>
          )}
          {navItem('payments', 'Payments', CreditCard)}
          {navItem('reports', 'Reports', BarChart3)}

          {(!collapsed || mobileOpen) && (
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--secondary-text)', textTransform: 'uppercase', margin: '14px 10px 4px 10px', letterSpacing: '0.5px' }}>
              System
            </div>
          )}
          {navItem('templates', 'Templates', LayoutTemplate)}
          {navItem('settings', 'Settings', Settings)}
        </div>

        {/* Footer Logout Action */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={() => { onLogout(); onCloseMobile(); }}
            title="Sign Out"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: collapsed && !mobileOpen ? '10px 0' : '8px 12px',
              justifyContent: collapsed && !mobileOpen ? 'center' : 'flex-start',
              borderRadius: '6px',
              border: '1px solid #FCA5A5',
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} />
            {(!collapsed || mobileOpen) && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
