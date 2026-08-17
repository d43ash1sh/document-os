import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CreditCard, 
  Hash, 
  Download, 
  Upload, 
  Save, 
  Trash2, 
  Sparkles, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import type { BusinessProfile, PaymentSettings, NumberingSettings, AppSettings } from '../../types';
import { SettingsRepository } from '../../lib/repositories/settingsRepository';
import { BackupEngine } from '../../lib/backup/backupEngine';
import { db } from '../../lib/database/db';
import { ConfirmModal } from '../../components/ConfirmModal';

interface SettingsViewProps {
  onRefresh: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'payment' | 'numbering' | 'backup'>('profile');
  
  const [profile, setProfile] = useState<BusinessProfile>({
    name: '', displayName: '', tagline: '', logo: '', phone: '', email: '',
    website: '', address: '', city: '', state: '', country: 'India', pin: '',
    gstin: '', pan: '', signature: ''
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    accountHolder: '', bankName: '', accountNumber: '', ifsc: '', branch: '',
    upiId: '', upiQr: '', paymentInstructions: ''
  });

  const [numbering, setNumbering] = useState<NumberingSettings | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importingError, setImportingError] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const p = await SettingsRepository.getBusinessProfile();
    const pay = await SettingsRepository.getPaymentSettings();
    const num = await SettingsRepository.getNumberingSettings();
    setProfile(p);
    setPaymentSettings(pay);
    setNumbering(num);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await SettingsRepository.saveBusinessProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    onRefresh();
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    await SettingsRepository.savePaymentSettings(paymentSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    onRefresh();
  };

  const handleSaveNumbering = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numbering) {
      await SettingsRepository.saveNumberingSettings(numbering);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      onRefresh();
    }
  };

  const handleExportBackup = async () => {
    await BackupEngine.downloadBackupFile();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const val = BackupEngine.validateBackupFile(json);
      if (!val.valid) {
        setImportingError(val.error || 'Invalid backup file');
        return;
      }
      setImportingError(null);
      if (window.confirm(`Restore backup containing ${val.stats?.clients} clients, ${val.stats?.documents} documents, and ${val.stats?.payments} payment records? Current local database will be replaced.`)) {
        await BackupEngine.restoreBackup(json);
        alert('Backup successfully restored!');
        onRefresh();
        loadSettings();
      }
    } catch (err: any) {
      setImportingError('Failed to parse backup JSON file: ' + err.message);
    }
  };

  const handleResetDatabase = async () => {
    await db.clients.clear();
    await db.services.clear();
    await db.documents.clear();
    await db.payments.clear();
    await db.revisions.clear();
    setIsResetConfirmOpen(false);
    onRefresh();
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>System & Workspace Settings</h2>
          <p style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>
            Configure your business profile, bank details, document numbering rules, and local backups.
          </p>
        </div>

        {savedSuccess && (
          <div className="badge badge-success fade-in" style={{ padding: '6px 12px', fontSize: '13px' }}>
            <CheckCircle2 size={16} /> Settings Saved Successfully
          </div>
        )}
      </div>

      {/* Settings Navigation Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '16px' }}>
        {[
          { key: 'profile', label: 'Business Profile', icon: Building2 },
          { key: 'payment', label: 'Bank & UPI Details', icon: CreditCard },
          { key: 'numbering', label: 'Document Numbering', icon: Hash },
          { key: 'backup', label: 'Backup & Data Management', icon: Download }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                borderBottom: active ? '2px solid var(--primary-purple)' : 'none',
                color: active ? 'var(--primary-purple)' : 'var(--secondary-text)',
                fontWeight: active ? 700 : 500,
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Business Profile Form */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '700px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Business Profile & Branding</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Business Legal Name *</label>
              <input type="text" required value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="e.g. Debashish Tech Solutions" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Tagline / Subtitle</label>
              <input type="text" value={profile.tagline} onChange={e => setProfile({ ...profile, tagline: e.target.value })} placeholder="e.g. Web Development Services" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Business Email</label>
              <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} placeholder="contact@debashish.com" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Phone Number</label>
              <input type="text" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="+91 98765 43210" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600 }}>Street Address</label>
            <input type="text" value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>City</label>
              <input type="text" value={profile.city} onChange={e => setProfile({ ...profile, city: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>State</label>
              <input type="text" value={profile.state} onChange={e => setProfile({ ...profile, state: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>PIN Code</label>
              <input type="text" value={profile.pin} onChange={e => setProfile({ ...profile, pin: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>GSTIN Number</label>
              <input type="text" value={profile.gstin} onChange={e => setProfile({ ...profile, gstin: e.target.value })} placeholder="22AAAAA0000A1Z5" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>PAN Number</label>
              <input type="text" value={profile.pan} onChange={e => setProfile({ ...profile, pan: e.target.value })} placeholder="ABCDE1234F" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button type="submit" className="btn-primary">
              <Save size={16} /> Save Profile
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Bank & UPI Details Form */}
      {activeTab === 'payment' && (
        <form onSubmit={handleSavePayment} className="card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '700px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Bank Account & UPI Payment Details</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Bank Name</label>
              <input type="text" value={paymentSettings.bankName} onChange={e => setPaymentSettings({ ...paymentSettings, bankName: e.target.value })} placeholder="e.g. HDFC Bank" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Account Holder Name</label>
              <input type="text" value={paymentSettings.accountHolder} onChange={e => setPaymentSettings({ ...paymentSettings, accountHolder: e.target.value })} placeholder="e.g. Debashish Services" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Account Number</label>
              <input type="text" value={paymentSettings.accountNumber} onChange={e => setPaymentSettings({ ...paymentSettings, accountNumber: e.target.value })} placeholder="50100012345678" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>IFSC Code</label>
              <input type="text" value={paymentSettings.ifsc} onChange={e => setPaymentSettings({ ...paymentSettings, ifsc: e.target.value })} placeholder="HDFC0000123" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600 }}>UPI ID</label>
            <input type="text" value={paymentSettings.upiId} onChange={e => setPaymentSettings({ ...paymentSettings, upiId: e.target.value })} placeholder="debashish@upi" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }} />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600 }}>Default Payment Instructions</label>
            <textarea rows={3} value={paymentSettings.paymentInstructions} onChange={e => setPaymentSettings({ ...paymentSettings, paymentInstructions: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button type="submit" className="btn-primary">
              <Save size={16} /> Save Payment Details
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Document Numbering Rules Form */}
      {activeTab === 'numbering' && numbering && (
        <form onSubmit={handleSaveNumbering} className="card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '700px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Document Numbering Prefixes & Auto-Increment Rules</h3>

          {Object.entries(numbering).map(([docType, rule]) => (
            <div key={docType} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '10px', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <strong style={{ fontSize: '13px', textTransform: 'capitalize' }}>{docType.replace('_', ' ')}</strong>
              <div>
                <label style={{ fontSize: '10px', color: 'var(--secondary-text)' }}>Prefix</label>
                <input type="text" value={rule.prefix} onChange={e => setNumbering({ ...numbering, [docType]: { ...rule, prefix: e.target.value } })} style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: 'var(--secondary-text)' }}>Year Format</label>
                <select value={rule.yearFormat} onChange={e => setNumbering({ ...numbering, [docType]: { ...rule, yearFormat: e.target.value as any } })} style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px' }}>
                  <option value="YYYY">YYYY (2026)</option>
                  <option value="YY-YY">YY-YY (26-27)</option>
                  <option value="NONE">None</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '10px', color: 'var(--secondary-text)' }}>Next Number</label>
                <input type="number" value={rule.nextNumber} onChange={e => setNumbering({ ...numbering, [docType]: { ...rule, nextNumber: Number(e.target.value) } })} style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px' }} />
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button type="submit" className="btn-primary">
              <Save size={16} /> Save Numbering Rules
            </button>
          </div>
        </form>
      )}

      {/* Tab 4: Backup Export & Import */}
      {activeTab === 'backup' && (
        <div className="card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Local Database Backup & Restore</h3>
            <p style={{ fontSize: '13px', color: 'var(--secondary-text)', marginTop: '4px' }}>
              Your business data is stored 100% locally in your browser (IndexedDB). Export regular JSON backups to keep your data safe.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, border: '1px solid var(--border-color)', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
              <Download size={32} color="var(--primary-purple)" style={{ marginBottom: '10px' }} />
              <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Export JSON Backup</h4>
              <p style={{ fontSize: '12px', color: 'var(--secondary-text)', margin: '4px 0 14px 0' }}>
                Download a complete, versioned snapshot of clients, documents, payments and branding settings.
              </p>
              <button onClick={handleExportBackup} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Download Backup (.json)
              </button>
            </div>

            <div style={{ flex: 1, border: '1px dashed var(--border-color)', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
              <Upload size={32} color="var(--primary-purple)" style={{ marginBottom: '10px' }} />
              <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Restore from Backup</h4>
              <p style={{ fontSize: '12px', color: 'var(--secondary-text)', margin: '4px 0 14px 0' }}>
                Select a previously saved `.json` backup file to restore your entire workspace.
              </p>
              <input type="file" accept=".json" onChange={handleImportFile} style={{ display: 'none' }} id="import-file-input" />
              <label htmlFor="import-file-input" className="btn-secondary" style={{ display: 'inline-flex', width: '100%', justifyContent: 'center', cursor: 'pointer' }}>
                Select Backup File
              </label>
              {importingError && <div style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '8px' }}>{importingError}</div>}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '10px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--danger)' }}>Danger Zone</h4>
            <p style={{ fontSize: '12px', color: 'var(--secondary-text)', margin: '4px 0 12px 0' }}>
              Wipe all local client, document, and payment records to reset to an empty state.
            </p>
            <button onClick={() => setIsResetConfirmOpen(true)} className="btn-danger">
              <Trash2 size={15} /> Wipe Local Database
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Wipe Local Database"
        message="Are you sure you want to delete ALL clients, documents and payments from this device? Make sure you have exported a backup first!"
        confirmText="Wipe Everything"
        isDanger
        onConfirm={handleResetDatabase}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
