import React, { useState, useEffect } from 'react';
import { Search, FileText, Receipt, Users, Briefcase, Settings, Download, X } from 'lucide-react';
import { ClientRepository } from '../lib/repositories/clientRepository';
import { DocumentRepository } from '../lib/repositories/documentRepository';
import type { Client, BusinessDocument } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: string, payload?: any) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectAction
}) => {
  const [query, setQuery] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      loadSearchResults('');
    }
  }, [isOpen]);

  const loadSearchResults = async (q: string) => {
    const matchedClients = await ClientRepository.search(q);
    const allDocs = await DocumentRepository.getAll();
    const matchedDocs = q 
      ? allDocs.filter(d => d.number.toLowerCase().includes(q.toLowerCase()) || d.type.toLowerCase().includes(q.toLowerCase()))
      : allDocs.slice(0, 5);

    setClients(matchedClients.slice(0, 4));
    setDocuments(matchedDocs.slice(0, 5));
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    loadSearchResults(val);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '80px'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="fade-in"
        style={{
          width: '600px',
          maxHeight: '80vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Search input header */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <Search size={20} color="var(--primary-purple)" />
          <input
            type="text"
            placeholder="Type a command, document # or client name..."
            value={query}
            onChange={handleQueryChange}
            autoFocus
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              color: 'var(--dark-text)',
              backgroundColor: 'transparent'
            }}
          />
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary-text)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search results list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {/* Quick Actions */}
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--secondary-text)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
            Quick Actions
          </div>
          <div
            onClick={() => { onSelectAction('new_quotation'); onClose(); }}
            style={{ padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}
          >
            <FileText size={16} color="var(--primary-purple)" />
            <span>Create New Quotation</span>
          </div>
          <div
            onClick={() => { onSelectAction('new_invoice'); onClose(); }}
            style={{ padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}
          >
            <Receipt size={16} color="var(--primary-purple)" />
            <span>Create New Invoice</span>
          </div>
          <div
            onClick={() => { onSelectAction('new_client'); onClose(); }}
            style={{ padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}
          >
            <Users size={16} color="var(--primary-purple)" />
            <span>Add New Client</span>
          </div>
          <div
            onClick={() => { onSelectAction('export_backup'); onClose(); }}
            style={{ padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}
          >
            <Download size={16} color="var(--primary-purple)" />
            <span>Export Database Backup (JSON)</span>
          </div>

          {/* Matched Clients */}
          {clients.length > 0 && (
            <>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--secondary-text)', textTransform: 'uppercase', margin: '14px 0 6px 0', letterSpacing: '0.5px' }}>
                Clients ({clients.length})
              </div>
              {clients.map(c => (
                <div
                  key={c.id}
                  onClick={() => { onSelectAction('view_client', c.id); onClose(); }}
                  style={{ padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Users size={16} color="var(--secondary-text)" />
                    <span style={{ fontWeight: 500 }}>{c.name}</span>
                    {c.organization && <span style={{ color: 'var(--secondary-text)', fontSize: '12px' }}>({c.organization})</span>}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>{c.email}</span>
                </div>
              ))}
            </>
          )}

          {/* Matched Documents */}
          {documents.length > 0 && (
            <>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--secondary-text)', textTransform: 'uppercase', margin: '14px 0 6px 0', letterSpacing: '0.5px' }}>
                Documents ({documents.length})
              </div>
              {documents.map(d => (
                <div
                  key={d.id}
                  onClick={() => { onSelectAction('view_document', d.id); onClose(); }}
                  style={{ padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={16} color="var(--secondary-text)" />
                    <span style={{ fontWeight: 600, color: 'var(--primary-purple)' }}>{d.number}</span>
                    <span style={{ textTransform: 'capitalize', fontSize: '12px', color: 'var(--secondary-text)' }}>({d.type})</span>
                  </div>
                  <span style={{ fontWeight: 600 }}>₹{d.grandTotal.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
