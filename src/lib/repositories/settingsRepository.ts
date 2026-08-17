import { 
  db, 
  DEFAULT_BUSINESS_PROFILE, 
  DEFAULT_PAYMENT_SETTINGS, 
  DEFAULT_NUMBERING_SETTINGS, 
  DEFAULT_APP_SETTINGS 
} from '../database/db';
import type { 
  BusinessProfile, 
  PaymentSettings, 
  NumberingSettings, 
  AppSettings, 
  DocumentType 
} from '../../types';

export const SettingsRepository = {
  async getBusinessProfile(): Promise<BusinessProfile> {
    const item = await db.settings.get('businessProfile');
    return item ? item.value : DEFAULT_BUSINESS_PROFILE;
  },

  async saveBusinessProfile(profile: BusinessProfile): Promise<void> {
    await db.settings.put({ key: 'businessProfile', value: profile });
  },

  async getPaymentSettings(): Promise<PaymentSettings> {
    const item = await db.settings.get('paymentSettings');
    return item ? item.value : DEFAULT_PAYMENT_SETTINGS;
  },

  async savePaymentSettings(settings: PaymentSettings): Promise<void> {
    await db.settings.put({ key: 'paymentSettings', value: settings });
  },

  async getNumberingSettings(): Promise<NumberingSettings> {
    const item = await db.settings.get('numberingSettings');
    return item ? item.value : DEFAULT_NUMBERING_SETTINGS;
  },

  async saveNumberingSettings(settings: NumberingSettings): Promise<void> {
    await db.settings.put({ key: 'numberingSettings', value: settings });
  },

  async getAppSettings(): Promise<AppSettings> {
    const item = await db.settings.get('appSettings');
    return item ? item.value : DEFAULT_APP_SETTINGS;
  },

  async saveAppSettings(settings: AppSettings): Promise<void> {
    await db.settings.put({ key: 'appSettings', value: settings });
  },

  async generateNextDocumentNumber(type: DocumentType): Promise<string> {
    const numbering = await this.getNumberingSettings();
    const rule = numbering[type] || DEFAULT_NUMBERING_SETTINGS[type];

    const currentYear = new Date().getFullYear();
    let yearStr = '';
    if (rule.yearFormat === 'YYYY') {
      yearStr = `${rule.separator}${currentYear}`;
    } else if (rule.yearFormat === 'YY-YY') {
      yearStr = `${rule.separator}${String(currentYear).slice(-2)}-${String(currentYear + 1).slice(-2)}`;
    }

    const paddedNum = String(rule.nextNumber).padStart(rule.padding, '0');
    const docNumber = `${rule.prefix}${yearStr}${rule.separator}${paddedNum}`;

    // Auto-increment and save
    numbering[type] = {
      ...rule,
      nextNumber: rule.nextNumber + 1
    };
    await this.saveNumberingSettings(numbering);

    return docNumber;
  }
};
