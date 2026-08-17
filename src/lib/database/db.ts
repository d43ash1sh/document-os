import Dexie, { type Table } from 'dexie';
import type { 
  Client, 
  Service, 
  BusinessDocument, 
  Payment, 
  DocumentRevision, 
  BusinessProfile, 
  PaymentSettings, 
  NumberingSettings, 
  AppSettings 
} from '../../types';

export class BusinessDocumentDB extends Dexie {
  clients!: Table<Client, string>;
  services!: Table<Service, string>;
  documents!: Table<BusinessDocument, string>;
  payments!: Table<Payment, string>;
  revisions!: Table<DocumentRevision, string>;

  // Settings tables key-value store
  settings!: Table<{ key: string; value: any }, string>;

  constructor() {
    super('BusinessDocumentOS_DB');
    
    this.version(1).stores({
      clients: 'id, name, organization, email, phone, createdAt',
      services: 'id, name, category, active',
      documents: 'id, type, number, clientId, status, issueDate, dueDate, paymentStatus, createdAt',
      payments: 'id, clientId, documentId, paymentDate, paymentMethod',
      revisions: 'id, documentId, revisionNumber, createdAt',
      settings: 'key'
    });
  }
}

export const db = new BusinessDocumentDB();

// Initial Default Settings
export const DEFAULT_BUSINESS_PROFILE: BusinessProfile = {
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
};

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  accountHolder: '',
  bankName: '',
  accountNumber: '',
  ifsc: '',
  branch: '',
  upiId: '',
  upiQr: '',
  paymentInstructions: 'Please make payments via Bank Transfer or UPI. Mention the document number in the payment reference.'
};

export const DEFAULT_NUMBERING_SETTINGS: NumberingSettings = {
  quotation: { prefix: 'QTN', yearFormat: 'YYYY', startingNumber: 1, padding: 4, separator: '-', nextNumber: 1 },
  invoice: { prefix: 'INV', yearFormat: 'YYYY', startingNumber: 1, padding: 4, separator: '-', nextNumber: 1 },
  estimate: { prefix: 'EST', yearFormat: 'YYYY', startingNumber: 1, padding: 4, separator: '-', nextNumber: 1 },
  proforma: { prefix: 'PI', yearFormat: 'YYYY', startingNumber: 1, padding: 4, separator: '-', nextNumber: 1 },
  proposal: { prefix: 'PROP', yearFormat: 'YYYY', startingNumber: 1, padding: 4, separator: '-', nextNumber: 1 },
  work_order: { prefix: 'WO', yearFormat: 'YYYY', startingNumber: 1, padding: 4, separator: '-', nextNumber: 1 },
  receipt: { prefix: 'RCT', yearFormat: 'YYYY', startingNumber: 1, padding: 4, separator: '-', nextNumber: 1 },
  payment_receipt: { prefix: 'PR', yearFormat: 'YYYY', startingNumber: 1, padding: 4, separator: '-', nextNumber: 1 },
  amc: { prefix: 'AMC', yearFormat: 'YYYY', startingNumber: 1, padding: 4, separator: '-', nextNumber: 1 }
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  currency: 'INR',
  currencySymbol: '₹',
  dateFormat: 'DD MMM YYYY',
  taxInclusiveDefault: false,
  onboardingCompleted: false
};
