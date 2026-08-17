import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Printer, 
  Plus, 
  Trash2, 
  CheckCircle,
  FileText,
  ShieldCheck,
  CreditCard,
  Building,
  Clock,
  AlertCircle
} from 'lucide-react';
import type { 
  BusinessDocument, 
  DocumentType, 
  Client, 
  Service, 
  LineItem, 
  Milestone, 
  BusinessProfile, 
  PaymentSettings 
} from '../../types';
import { DocumentRepository } from '../../lib/repositories/documentRepository';
import { calculateDocument, updateMilestoneAmounts } from '../../lib/calculations/calculationEngine';
import { formatCurrency, formatDate, amountToWords } from '../../lib/formatting/formatters';
import { generateDocumentPDF, printDocumentElement } from '../../lib/document-engine/pdfGenerator';
import { generateDocumentDOCX } from '../../lib/document-engine/docxGenerator';

interface DocumentEditorProps {
  initialDocument?: BusinessDocument | null;
  defaultType?: DocumentType;
  clients: Client[];
  services: Service[];
  businessProfile: BusinessProfile;
  paymentSettings: PaymentSettings;
  onBack: () => void;
  onSaved: (doc: BusinessDocument) => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  initialDocument,
  defaultType = 'quotation',
  clients,
  services,
  businessProfile,
  paymentSettings,
  onBack,
  onSaved
}) => {
  const [docData, setDocData] = useState<Partial<BusinessDocument>>(() => {
    if (initialDocument) return JSON.parse(JSON.stringify(initialDocument));
    return {
      type: defaultType,
      status: defaultType === 'invoice' ? 'issued' : 'draft',
      clientId: clients[0]?.id || '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: 'INR',
      templateId: 'modern-purple',
      taxBehavior: 'exclusive',
      items: [],
      documentDiscountType: 'percentage',
      documentDiscountValue: 0,
      paymentMilestones: [],
      terms: `1. Validity: This document is valid for 30 days from issue date.\n2. GST: Applicable taxes as stated.`,
      notes: '',
      customSections: [],
      showLogo: true,
      showBusinessAddress: true,
      showGstin: true,
      showBankDetails: true,
      showUpi: true,
      showQr: true,
      showSignature: true,
      showTerms: true,
      showPaymentInstructions: true
    };
  });

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'items' | 'milestones' | 'terms' | 'settings'>('items');

  const selectedClient = useMemo(() => {
    return clients.find(c => c.id === docData.clientId);
  }, [clients, docData.clientId]);

  const calculated = useMemo(() => {
    const clientTaxType = selectedClient ? selectedClient.taxType : 'GST_INTRA';
    return calculateDocument(docData, clientTaxType);
  }, [docData, selectedClient]);

  useEffect(() => {
    if (docData.paymentMilestones?.length) {
      const updated = updateMilestoneAmounts(docData.paymentMilestones, calculated.grandTotal);
      setDocData(prev => ({ ...prev, paymentMilestones: updated }));
    }
  }, [calculated.grandTotal]);

  const handleAddItem = () => {
    const newItem: LineItem = {
      id: 'item_' + crypto.randomUUID(),
      name: 'Custom Service Item',
      description: '',
      quantity: 1,
      unit: 'Unit',
      rate: 1000,
      discountType: 'percentage',
      discountValue: 0,
      taxRate: 18,
      taxType: 'gst',
      hsnSac: '998314',
      amount: 1000
    };
    setDocData(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
  };

  const handleSelectServiceCatalog = (idx: number, serviceId: string) => {
    const srv = services.find(s => s.id === serviceId);
    if (!srv) return;
    const updatedItems = [...(docData.items || [])];
    updatedItems[idx] = {
      ...updatedItems[idx],
      serviceId: srv.id,
      name: srv.name,
      description: srv.description,
      rate: srv.defaultRate,
      unit: srv.unit,
      taxRate: srv.taxRate,
      taxType: srv.taxType,
      hsnSac: srv.hsnSac
    };
    setDocData({ ...docData, items: updatedItems });
  };

  const handleItemChange = (idx: number, field: keyof LineItem, value: any) => {
    const updatedItems = [...(docData.items || [])];
    updatedItems[idx] = { ...updatedItems[idx], [field]: value };
    setDocData({ ...docData, items: updatedItems });
  };

  const handleDeleteItem = (idx: number) => {
    const updatedItems = (docData.items || []).filter((_, i) => i !== idx);
    setDocData({ ...docData, items: updatedItems });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let savedDoc: BusinessDocument;
      if (docData.id) {
        savedDoc = await DocumentRepository.update(docData.id, docData);
      } else {
        savedDoc = await DocumentRepository.create(docData as any);
      }
      onSaved(savedDoc);
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = async () => {
    let currentDoc = docData as BusinessDocument;
    if (!docData.id) {
      currentDoc = await DocumentRepository.create(docData as any);
      onSaved(currentDoc);
    }
    await generateDocumentPDF('document-a4-preview', currentDoc, selectedClient);
  };

  const handleExportDOCX = async () => {
    let currentDoc = docData as BusinessDocument;
    if (!docData.id) {
      currentDoc = await DocumentRepository.create(docData as any);
      onSaved(currentDoc);
    }
    await generateDocumentDOCX(currentDoc, selectedClient, businessProfile, paymentSettings);
  };

  const docType = docData.type || 'quotation';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* Action Toolbar Header */}
      <div
        style={{
          padding: '12px 24px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={onBack} className="btn-secondary" style={{ padding: '6px 12px' }}>
            <ArrowLeft size={16} /> Back
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>Format / Type:</span>
            <select
              value={docData.type}
              onChange={e => setDocData({ ...docData, type: e.target.value as DocumentType })}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: 700, color: 'var(--primary-purple)', backgroundColor: 'var(--light-purple)' }}
            >
              <option value="quotation">Quotation (Commercial Proposal)</option>
              <option value="invoice">Tax Invoice (Official Bill)</option>
              <option value="estimate">Estimate (Cost Estimate)</option>
              <option value="proforma">Proforma Invoice (Pre-Billing)</option>
              <option value="proposal">Project Proposal (Pitch & Scope)</option>
              <option value="work_order">Work Order (Service Agreement)</option>
              <option value="receipt">Receipt (Payment Voucher)</option>
              <option value="payment_receipt">Payment Receipt (Proof)</option>
              <option value="amc">AMC (Annual Maintenance)</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => printDocumentElement('document-a4-preview')} className="btn-secondary">
            <Printer size={15} /> Print
          </button>
          <button onClick={handleExportDOCX} className="btn-secondary">
            <Download size={15} /> DOCX
          </button>
          <button onClick={handleExportPDF} className="btn-secondary">
            <Download size={15} color="var(--primary-purple)" /> PDF
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Document'}
          </button>
        </div>
      </div>

      {/* Editor & Live Canvas Workspace */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }}>
        {/* Left Input Controls */}
        <div style={{ padding: '24px', overflowY: 'auto', borderRight: '1px solid var(--border-color)', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-purple)' }}>
              Document Metadata
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Select Client *</label>
                <select
                  value={docData.clientId}
                  onChange={e => setDocData({ ...docData, clientId: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }}
                >
                  <option value="">-- Select Client --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name} {c.organization ? `(${c.organization})` : ''}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Document Status</label>
                <select
                  value={docData.status}
                  onChange={e => setDocData({ ...docData, status: e.target.value as any })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }}
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="issued">Issued</option>
                  <option value="accepted">Accepted</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Issue Date</label>
                <input type="date" value={docData.issueDate} onChange={e => setDocData({ ...docData, issueDate: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Due / Valid Date</label>
                <input type="date" value={docData.dueDate} onChange={e => setDocData({ ...docData, dueDate: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Tax Mode</label>
                <select value={docData.taxBehavior} onChange={e => setDocData({ ...docData, taxBehavior: e.target.value as any })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }}>
                  <option value="exclusive">Tax Exclusive (+ GST)</option>
                  <option value="inclusive">Tax Inclusive (Prices incl. GST)</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '16px' }}>
            {['items', 'milestones', 'terms', 'settings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid var(--primary-purple)' : 'none',
                  color: activeTab === tab ? 'var(--primary-purple)' : 'var(--secondary-text)',
                  fontWeight: activeTab === tab ? 700 : 500,
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'items' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Line Items</h4>
                <button onClick={handleAddItem} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>
                  <Plus size={14} /> Add Item
                </button>
              </div>

              {(docData.items || []).map((item, idx) => (
                <div key={item.id} className="card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#FAFAFA' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--primary-purple)' }}>Item #{idx + 1}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {services.length > 0 && (
                        <select onChange={e => handleSelectServiceCatalog(idx, e.target.value)} style={{ fontSize: '11px', padding: '2px 6px' }}>
                          <option value="">Load from Catalog...</option>
                          {services.map(s => <option key={s.id} value={s.id}>{s.name} (₹{s.defaultRate})</option>)}
                        </select>
                      )}
                      <button onClick={() => handleDeleteItem(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input type="text" placeholder="Item Name *" value={item.name} onChange={e => handleItemChange(idx, 'name', e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '13px' }} />
                    <input type="text" placeholder="Unit (e.g. Project, Hours)" value={item.unit} onChange={e => handleItemChange(idx, 'unit', e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '13px' }} />
                  </div>

                  <input type="text" placeholder="Description" value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px' }} />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11px' }}>Qty</label>
                      <input type="number" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '13px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px' }}>Rate (₹)</label>
                      <input type="number" value={item.rate} onChange={e => handleItemChange(idx, 'rate', Number(e.target.value))} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '13px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px' }}>Discount</label>
                      <input type="number" value={item.discountValue} onChange={e => handleItemChange(idx, 'discountValue', Number(e.target.value))} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '13px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px' }}>GST %</label>
                      <input type="number" value={item.taxRate} onChange={e => handleItemChange(idx, 'taxRate', Number(e.target.value))} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '13px' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'milestones' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Payment Milestones Schedule</h4>
                <button
                  onClick={() => {
                    const newM: Milestone = { id: 'm_' + crypto.randomUUID(), name: 'New Milestone', percentage: 20, amount: 0, dueDate: '', description: '', status: 'pending' };
                    setDocData({ ...docData, paymentMilestones: [...(docData.paymentMilestones || []), newM] });
                  }}
                  className="btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}
                >
                  <Plus size={14} /> Add Milestone
                </button>
              </div>

              {(docData.paymentMilestones || []).map((m, idx) => (
                <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '8px', alignItems: 'center' }}>
                  <input type="text" value={m.name} onChange={e => {
                    const ms = [...(docData.paymentMilestones || [])];
                    ms[idx].name = e.target.value;
                    setDocData({ ...docData, paymentMilestones: ms });
                  }} style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px' }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input type="number" value={m.percentage} onChange={e => {
                      const ms = [...(docData.paymentMilestones || [])];
                      ms[idx].percentage = Number(e.target.value);
                      setDocData({ ...docData, paymentMilestones: ms });
                    }} style={{ width: '60px', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px' }} />
                    <span style={{ fontSize: '12px' }}>%</span>
                  </div>

                  <strong style={{ fontSize: '12px' }}>{formatCurrency(m.amount)}</strong>

                  <button onClick={() => {
                    const ms = (docData.paymentMilestones || []).filter((_, i) => i !== idx);
                    setDocData({ ...docData, paymentMilestones: ms });
                  }} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'terms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Terms & Conditions</label>
                <textarea rows={6} value={docData.terms} onChange={e => setDocData({ ...docData, terms: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Payment Notes</label>
                <textarea rows={3} value={docData.notes} onChange={e => setDocData({ ...docData, notes: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }} />
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Section Visibility Toggles</h4>
              {[
                { key: 'showLogo', label: 'Show Business Logo' },
                { key: 'showGstin', label: 'Show GSTIN' },
                { key: 'showBankDetails', label: 'Show Bank Details' },
                { key: 'showUpi', label: 'Show UPI & QR' },
                { key: 'showTerms', label: 'Show Terms' },
                { key: 'showSignature', label: 'Show Signature Box' }
              ].map(opt => (
                <label key={opt.key} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={(docData as any)[opt.key]}
                    onChange={e => setDocData({ ...docData, [opt.key]: e.target.checked })}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Right Live Canvas — Distinct Layout per Document Type */}
        <div className="a4-canvas-container">
          <div id="document-a4-preview" className="a4-document">
            
            {/* 1. DISTINCT HEADER BANNER BASED ON TYPE */}
            {docType === 'quotation' && (
              <div style={{ borderBottom: '3px solid var(--primary-purple)', paddingBottom: '14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  {docData.showLogo && businessProfile.logo && <img src={businessProfile.logo} alt="Logo" style={{ maxHeight: '44px', marginBottom: '6px' }} />}
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-purple)', margin: 0 }}>{businessProfile.name || 'Your Business Name'}</h2>
                  <div style={{ fontSize: '11px', color: 'var(--secondary-text)' }}>{businessProfile.tagline}</div>
                  <div style={{ fontSize: '11px', marginTop: '2px' }}>{businessProfile.address} {businessProfile.city}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ backgroundColor: 'var(--primary-purple)', color: 'white', padding: '4px 12px', borderRadius: '4px', fontWeight: 800, fontSize: '16px', display: 'inline-block' }}>
                    QUOTATION ESTIMATE
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, marginTop: '6px' }}># {docData.number}</div>
                  <div style={{ fontSize: '11px', color: 'var(--secondary-text)' }}>Date: {formatDate(docData.issueDate)}</div>
                  <div style={{ fontSize: '11px', color: 'var(--primary-purple)', fontWeight: 700 }}>Valid Until: {formatDate(docData.validUntil || docData.dueDate)}</div>
                </div>
              </div>
            )}

            {docType === 'invoice' && (
              <div style={{ borderBottom: '3px solid #15803D', paddingBottom: '14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  {docData.showLogo && businessProfile.logo && <img src={businessProfile.logo} alt="Logo" style={{ maxHeight: '44px', marginBottom: '6px' }} />}
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--dark-text)', margin: 0 }}>{businessProfile.name}</h2>
                  <div style={{ fontSize: '11px', color: 'var(--secondary-text)' }}>{businessProfile.tagline}</div>
                  {docData.showGstin && businessProfile.gstin && <div style={{ fontSize: '11px', fontWeight: 700 }}>GSTIN: {businessProfile.gstin}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ backgroundColor: '#15803D', color: 'white', padding: '4px 12px', borderRadius: '4px', fontWeight: 900, fontSize: '18px', display: 'inline-block' }}>
                    TAX INVOICE / BILL
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 900, marginTop: '6px', color: 'var(--dark-text)' }}># {docData.number}</div>
                  <div style={{ fontSize: '11px' }}>Issue Date: {formatDate(docData.issueDate)}</div>
                  <div style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 700 }}>Due Date: {formatDate(docData.dueDate)}</div>
                  <div className="badge badge-success" style={{ marginTop: '4px' }}>
                    PAYMENT STATUS: {docData.paymentStatus?.toUpperCase() || 'UNPAID'}
                  </div>
                </div>
              </div>
            )}

            {docType === 'estimate' && (
              <div style={{ borderBottom: '3px dashed #475569', paddingBottom: '14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  {docData.showLogo && businessProfile.logo && <img src={businessProfile.logo} alt="Logo" style={{ maxHeight: '44px', marginBottom: '6px' }} />}
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#334155', margin: 0 }}>{businessProfile.name}</h2>
                  <div style={{ fontSize: '11px', color: 'var(--secondary-text)' }}>{businessProfile.tagline}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ backgroundColor: '#475569', color: 'white', padding: '4px 12px', borderRadius: '4px', fontWeight: 800, fontSize: '16px', display: 'inline-block' }}>
                    COST ESTIMATE
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--danger)', fontWeight: 700, marginTop: '2px' }}>* NON-BINDING ESTIMATE</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, marginTop: '4px' }}># {docData.number}</div>
                  <div style={{ fontSize: '11px' }}>Date: {formatDate(docData.issueDate)}</div>
                </div>
              </div>
            )}

            {docType === 'proforma' && (
              <div style={{ borderBottom: '3px solid #2563EB', paddingBottom: '14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  {docData.showLogo && businessProfile.logo && <img src={businessProfile.logo} alt="Logo" style={{ maxHeight: '44px', marginBottom: '6px' }} />}
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1E40AF', margin: 0 }}>{businessProfile.name}</h2>
                  <div style={{ fontSize: '11px', color: 'var(--secondary-text)' }}>{businessProfile.tagline}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ backgroundColor: '#2563EB', color: 'white', padding: '4px 12px', borderRadius: '4px', fontWeight: 800, fontSize: '16px', display: 'inline-block' }}>
                    PROFORMA INVOICE
                  </div>
                  <div style={{ fontSize: '11px', color: '#1E40AF', fontWeight: 700, marginTop: '2px' }}>PRE-BILLING FOR ADVANCE DEPOSIT</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, marginTop: '4px' }}># {docData.number}</div>
                  <div style={{ fontSize: '11px' }}>Date: {formatDate(docData.issueDate)}</div>
                </div>
              </div>
            )}

            {docType === 'proposal' && (
              <div style={{ borderBottom: '3px solid #7C3AED', paddingBottom: '14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  {docData.showLogo && businessProfile.logo && <img src={businessProfile.logo} alt="Logo" style={{ maxHeight: '44px', marginBottom: '6px' }} />}
                  <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#7C3AED', margin: 0 }}>{businessProfile.name}</h2>
                  <div style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>{businessProfile.tagline}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ backgroundColor: '#7C3AED', color: 'white', padding: '4px 14px', borderRadius: '4px', fontWeight: 900, fontSize: '18px', display: 'inline-block' }}>
                    PROJECT PROPOSAL
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, marginTop: '6px' }}># {docData.number}</div>
                  <div style={{ fontSize: '11px' }}>Prepared Date: {formatDate(docData.issueDate)}</div>
                </div>
              </div>
            )}

            {docType === 'work_order' && (
              <div style={{ borderBottom: '3px solid #0D9488', paddingBottom: '14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  {docData.showLogo && businessProfile.logo && <img src={businessProfile.logo} alt="Logo" style={{ maxHeight: '44px', marginBottom: '6px' }} />}
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F766E', margin: 0 }}>{businessProfile.name}</h2>
                  <div style={{ fontSize: '11px', color: 'var(--secondary-text)' }}>{businessProfile.tagline}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ backgroundColor: '#0D9488', color: 'white', padding: '4px 12px', borderRadius: '4px', fontWeight: 800, fontSize: '16px', display: 'inline-block' }}>
                    WORK ORDER AGREEMENT
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, marginTop: '6px' }}>WO #: {docData.number}</div>
                  <div style={{ fontSize: '11px' }}>Commencement: {formatDate(docData.issueDate)}</div>
                </div>
              </div>
            )}

            {(docType === 'receipt' || docType === 'payment_receipt') && (
              <div style={{ borderBottom: '3px solid #16A34A', paddingBottom: '14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  {docData.showLogo && businessProfile.logo && <img src={businessProfile.logo} alt="Logo" style={{ maxHeight: '44px', marginBottom: '6px' }} />}
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#15803D', margin: 0 }}>{businessProfile.name}</h2>
                  <div style={{ fontSize: '11px', color: 'var(--secondary-text)' }}>{businessProfile.tagline}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ backgroundColor: '#16A34A', color: 'white', padding: '4px 14px', borderRadius: '4px', fontWeight: 900, fontSize: '18px', display: 'inline-block' }}>
                    OFFICIAL RECEIPT
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, marginTop: '6px' }}>Receipt #: {docData.number}</div>
                  <div style={{ fontSize: '11px' }}>Payment Date: {formatDate(docData.issueDate)}</div>
                </div>
              </div>
            )}

            {docType === 'amc' && (
              <div style={{ borderBottom: '3px solid #4F46E5', paddingBottom: '14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  {docData.showLogo && businessProfile.logo && <img src={businessProfile.logo} alt="Logo" style={{ maxHeight: '44px', marginBottom: '6px' }} />}
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#4338CA', margin: 0 }}>{businessProfile.name}</h2>
                  <div style={{ fontSize: '11px', color: 'var(--secondary-text)' }}>{businessProfile.tagline}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ backgroundColor: '#4F46E5', color: 'white', padding: '4px 12px', borderRadius: '4px', fontWeight: 800, fontSize: '16px', display: 'inline-block' }}>
                    ANNUAL MAINTENANCE CONTRACT (AMC)
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, marginTop: '6px' }}>AMC #: {docData.number}</div>
                  <div style={{ fontSize: '11px' }}>Start Date: {formatDate(docData.issueDate)}</div>
                  <div style={{ fontSize: '11px', color: '#4338CA', fontWeight: 700 }}>Expiry: {formatDate(docData.dueDate)}</div>
                </div>
              </div>
            )}

            {/* 2. CLIENT METADATA SECTION */}
            <div style={{ backgroundColor: 'var(--light-purple)', border: '1px solid #DDD6FE', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--primary-purple)', letterSpacing: '0.5px' }}>
                BILLED TO / CLIENT DETAILS
              </div>
              {selectedClient ? (
                <div style={{ marginTop: '4px' }}>
                  <strong style={{ fontSize: '14px', color: 'var(--dark-text)' }}>{selectedClient.name}</strong>
                  {selectedClient.organization && <span style={{ fontSize: '12px', color: 'var(--secondary-text)' }}> ({selectedClient.organization})</span>}
                  <div style={{ fontSize: '12px', color: 'var(--dark-text)' }}>{selectedClient.address}, {selectedClient.city} {selectedClient.pinCode}</div>
                  <div style={{ fontSize: '11px', color: 'var(--secondary-text)' }}>Email: {selectedClient.email} | Ph: {selectedClient.phone}</div>
                  {selectedClient.gstin && <div style={{ fontSize: '11px', fontWeight: 700, marginTop: '2px' }}>GSTIN: {selectedClient.gstin}</div>}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--secondary-text)', fontStyle: 'italic' }}>No client selected yet</div>
              )}
            </div>

            {/* 3. TYPE-SPECIFIC DISCLAIMERS / SPECIAL SECTIONS */}
            {docType === 'estimate' && (
              <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D', padding: '10px 14px', borderRadius: '6px', fontSize: '11px', color: '#92400E', marginBottom: '16px' }}>
                <strong>ESTIMATE NOTICE:</strong> This document represents an initial budget estimate based on preliminary requirements. Prices and timelines are subject to final commercial confirmation upon formal quotation.
              </div>
            )}

            {docType === 'proforma' && (
              <div style={{ backgroundColor: '#DBEAFE', border: '1px solid #93C5FD', padding: '10px 14px', borderRadius: '6px', fontSize: '11px', color: '#1E40AF', marginBottom: '16px' }}>
                <strong>PROFORMA NOTICE:</strong> This is a pre-billing document for advance deposit. A tax invoice will be issued upon receipt of payment.
              </div>
            )}

            {docType === 'amc' && (
              <div style={{ backgroundColor: '#EEF2FF', border: '1px solid #C7D2FE', padding: '10px 14px', borderRadius: '6px', fontSize: '11px', color: '#3730A3', marginBottom: '16px' }}>
                <strong>SLA & COVERAGE:</strong> Standard 4-hour critical issue response window. Includes routine quarterly system health audits, updates, and emergency patch deployments.
              </div>
            )}

            {/* 4. LINE ITEMS TABLE */}
            <table className="doc-table">
              <thead>
                <tr>
                  <th style={{ width: '30px' }}>#</th>
                  <th>Service / Description</th>
                  <th className="align-right">Qty</th>
                  <th className="align-right">Rate</th>
                  <th className="align-right">Tax</th>
                  <th className="align-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(docData.items || []).map((item, idx) => {
                  const itemAmount = (item.quantity * item.rate) - (item.discountType === 'percentage' ? (item.quantity * item.rate * item.discountValue / 100) : item.discountValue);
                  return (
                    <tr key={item.id}>
                      <td>{idx + 1}</td>
                      <td>
                        <strong style={{ color: 'var(--dark-text)' }}>{item.name}</strong>
                        {item.description && <div style={{ fontSize: '11px', color: 'var(--secondary-text)' }}>{item.description}</div>}
                      </td>
                      <td className="align-right">{item.quantity} {item.unit}</td>
                      <td className="align-right">{formatCurrency(item.rate, '')}</td>
                      <td className="align-right">{item.taxRate ? `${item.taxRate}%` : '-'}</td>
                      <td className="align-right" style={{ fontWeight: 700 }}>{formatCurrency(itemAmount, '')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* 5. FINANCIAL SUMMARY CARD */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <div className="summary-card" style={{ width: '280px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>Subtotal:</span>
                  <strong>{formatCurrency(calculated.subtotal)}</strong>
                </div>
                {calculated.itemDiscountTotal > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', color: 'var(--danger)' }}>
                    <span>Item Discounts:</span>
                    <span>-{formatCurrency(calculated.itemDiscountTotal)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>Taxable Value:</span>
                  <strong>{formatCurrency(calculated.taxableAmount)}</strong>
                </div>
                {calculated.cgst > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span>CGST:</span>
                    <span>{formatCurrency(calculated.cgst)}</span>
                  </div>
                )}
                {calculated.sgst > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span>SGST:</span>
                    <span>{formatCurrency(calculated.sgst)}</span>
                  </div>
                )}
                {calculated.igst > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span>IGST:</span>
                    <span>{formatCurrency(calculated.igst)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 900, color: 'var(--primary-purple)', borderTop: '2px solid #DDD6FE', paddingTop: '6px', marginTop: '6px' }}>
                  <span>GRAND TOTAL:</span>
                  <span>{formatCurrency(calculated.grandTotal)}</span>
                </div>
                <div style={{ fontSize: '10px', fontStyle: 'italic', color: 'var(--secondary-text)', marginTop: '4px', textAlign: 'right' }}>
                  {amountToWords(calculated.grandTotal)}
                </div>
              </div>
            </div>

            {/* 6. PAYMENT MILESTONES TABLE (IF PRESENT) */}
            {docData.paymentMilestones && docData.paymentMilestones.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-purple)', marginBottom: '4px' }}>PAYMENT MILESTONES SCHEDULE</div>
                <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F3F4F6', textAlign: 'left' }}>
                      <th style={{ padding: '4px 8px' }}>Milestone</th>
                      <th style={{ padding: '4px 8px' }}>%</th>
                      <th style={{ padding: '4px 8px', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '4px 8px' }}>Terms</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docData.paymentMilestones.map(m => (
                      <tr key={m.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <td style={{ padding: '4px 8px', fontWeight: 600 }}>{m.name}</td>
                        <td style={{ padding: '4px 8px' }}>{m.percentage}%</td>
                        <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 700 }}>{formatCurrency(m.amount)}</td>
                        <td style={{ padding: '4px 8px', color: 'var(--secondary-text)' }}>{m.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 7. TYPE-SPECIFIC SIGNATURE / SIGN-OFF BLOCK */}
            <div style={{ marginTop: 'auto', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              {docData.showBankDetails && paymentSettings.bankName && (
                <div style={{ fontSize: '11px', border: '1px solid var(--border-color)', padding: '10px 14px', borderRadius: '6px', width: '320px' }}>
                  <strong style={{ color: 'var(--primary-purple)' }}>Bank Transfer Details</strong>
                  <div>Bank: {paymentSettings.bankName}</div>
                  <div>Account #: {paymentSettings.accountNumber}</div>
                  <div>IFSC: {paymentSettings.ifsc} | Name: {paymentSettings.accountHolder}</div>
                  {paymentSettings.upiId && <div style={{ fontWeight: 700, marginTop: '2px' }}>UPI ID: {paymentSettings.upiId}</div>}
                </div>
              )}

              {(docType === 'quotation' || docType === 'work_order' || docType === 'proposal') ? (
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ textAlign: 'center', width: '150px' }}>
                    <div style={{ borderBottom: '1px solid var(--dark-text)', height: '36px' }} />
                    <div style={{ fontSize: '10px', fontWeight: 700, marginTop: '4px' }}>Client Acceptance Sign-Off</div>
                    <div style={{ fontSize: '9px', color: 'var(--secondary-text)' }}>Date & Stamp</div>
                  </div>
                  <div style={{ textAlign: 'center', width: '150px' }}>
                    <div style={{ borderBottom: '1px solid var(--dark-text)', height: '36px' }} />
                    <div style={{ fontSize: '10px', fontWeight: 700, marginTop: '4px' }}>Authorized Provider</div>
                    <div style={{ fontSize: '9px', color: 'var(--secondary-text)' }}>{businessProfile.name}</div>
                  </div>
                </div>
              ) : (
                docData.showSignature && (
                  <div style={{ textAlign: 'center', width: '180px' }}>
                    <div style={{ borderBottom: '1px solid var(--dark-text)', height: '40px' }} />
                    <div style={{ fontSize: '11px', fontWeight: 700, marginTop: '4px' }}>Authorized Signature</div>
                    <div style={{ fontSize: '10px', color: 'var(--secondary-text)' }}>{businessProfile.name}</div>
                  </div>
                )
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
