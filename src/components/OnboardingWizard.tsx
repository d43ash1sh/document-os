import React, { useState } from 'react';
import { Building2, Image, CreditCard, Hash, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import type { BusinessProfile, PaymentSettings, NumberingSettings } from '../types';
import { SettingsRepository } from '../lib/repositories/settingsRepository';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<BusinessProfile>({
    name: '',
    displayName: '',
    tagline: '',
    logo: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pin: '',
    gstin: '',
    pan: '',
    signature: ''
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    ifsc: '',
    branch: '',
    upiId: '',
    upiQr: '',
    paymentInstructions: 'Please pay via Bank Transfer or UPI.'
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfile(p => ({ ...p, logo: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleFinish = async () => {
    await SettingsRepository.saveBusinessProfile(profile);
    await SettingsRepository.savePaymentSettings(paymentSettings);
    const appSettings = await SettingsRepository.getAppSettings();
    await SettingsRepository.saveAppSettings({ ...appSettings, onboardingCompleted: true });
    onComplete();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 250,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="fade-in"
        style={{
          width: '680px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Step Indicator Header */}
        <div style={{ backgroundColor: 'var(--light-purple)', padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-purple)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Welcome to Business Document OS
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--dark-text)', margin: '4px 0 0 0' }}>
            Set Up Your Business Profile
          </h2>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: s <= step ? 'var(--primary-purple)' : '#CBD5E1',
                  transition: 'background-color 0.2s ease'
                }}
              />
            ))}
          </div>
        </div>

        {/* Step Body */}
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={18} color="var(--primary-purple)" />
                Step 1: Business Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Business Name *</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    placeholder="e.g. Debashish Tech Services"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Tagline</label>
                  <input
                    type="text"
                    value={profile.tagline}
                    onChange={e => setProfile({ ...profile, tagline: e.target.value })}
                    placeholder="e.g. Web & Software Solutions"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={e => setProfile({ ...profile, email: e.target.value })}
                    placeholder="contact@debashish.com"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Phone</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Full Address</label>
                <input
                  type="text"
                  value={profile.address}
                  onChange={e => setProfile({ ...profile, address: e.target.value })}
                  placeholder="Street Address, City, State, PIN"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>GSTIN (Optional)</label>
                  <input
                    type="text"
                    value={profile.gstin}
                    onChange={e => setProfile({ ...profile, gstin: e.target.value })}
                    placeholder="22AAAAA0000A1Z5"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>PAN (Optional)</label>
                  <input
                    type="text"
                    value={profile.pan}
                    onChange={e => setProfile({ ...profile, pan: e.target.value })}
                    placeholder="ABCDE1234F"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Image size={18} color="var(--primary-purple)" />
                Step 2: Business Branding
              </h3>
              
              <div style={{ border: '1px dashed var(--border-color)', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Upload Company Logo</label>
                <input type="file" accept="image/*" onChange={handleLogoUpload} />
                {profile.logo && (
                  <div style={{ marginTop: '12px' }}>
                    <img src={profile.logo} alt="Logo Preview" style={{ maxHeight: '60px', objectFit: 'contain' }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={18} color="var(--primary-purple)" />
                Step 3: Bank & UPI Payment Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Bank Name</label>
                  <input
                    type="text"
                    value={paymentSettings.bankName}
                    onChange={e => setPaymentSettings({ ...paymentSettings, bankName: e.target.value })}
                    placeholder="HDFC Bank / ICICI / SBI"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Account Holder Name</label>
                  <input
                    type="text"
                    value={paymentSettings.accountHolder}
                    onChange={e => setPaymentSettings({ ...paymentSettings, accountHolder: e.target.value })}
                    placeholder="Debashish Services"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Account Number</label>
                  <input
                    type="text"
                    value={paymentSettings.accountNumber}
                    onChange={e => setPaymentSettings({ ...paymentSettings, accountNumber: e.target.value })}
                    placeholder="50100012345678"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>IFSC Code</label>
                  <input
                    type="text"
                    value={paymentSettings.ifsc}
                    onChange={e => setPaymentSettings({ ...paymentSettings, ifsc: e.target.value })}
                    placeholder="HDFC0000123"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>UPI ID</label>
                <input
                  type="text"
                  value={paymentSettings.upiId}
                  onChange={e => setPaymentSettings({ ...paymentSettings, upiId: e.target.value })}
                  placeholder="debashish@upi / 9876543210@paytm"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', marginTop: '4px' }}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <CheckCircle2 size={48} color="var(--success)" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Setup Ready!</h3>
              <p style={{ fontSize: '13px', color: 'var(--secondary-text)', marginTop: '4px' }}>
                Your local database and numbering rules have been configured. You can edit all settings anytime in the Settings menu.
              </p>
            </div>
          )}
        </div>

        {/* Modal Controls */}
        <div style={{ padding: '16px 24px', backgroundColor: '#F9FAFB', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} className="btn-secondary">
              <ChevronLeft size={16} /> Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button onClick={() => setStep(s => s + 1)} className="btn-primary">
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={handleFinish} className="btn-primary">
              Finish Setup & Launch
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
