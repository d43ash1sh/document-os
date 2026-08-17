export type DocumentType = 
  | 'quotation' 
  | 'invoice' 
  | 'estimate' 
  | 'proforma' 
  | 'proposal' 
  | 'work_order' 
  | 'receipt' 
  | 'payment_receipt' 
  | 'amc';

export type DocumentStatus = 
  | 'draft' 
  | 'sent' 
  | 'issued' 
  | 'accepted' 
  | 'rejected' 
  | 'expired' 
  | 'converted' 
  | 'partially_paid' 
  | 'paid' 
  | 'overdue' 
  | 'cancelled';

export type DiscountType = 'percentage' | 'fixed';

export type TaxType = 'none' | 'gst' | 'custom';

export type TaxBehavior = 'exclusive' | 'inclusive';

export type ClientTaxType = 'GST_INTRA' | 'GST_INTER' | 'EXEMPT';

export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Cheque' | 'Other';

export interface LineItem {
  id: string;
  serviceId?: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  discountType: DiscountType;
  discountValue: number;
  taxRate: number;
  taxType: TaxType;
  hsnSac?: string;
  amount: number;
}

export interface Milestone {
  id: string;
  name: string;
  percentage: number;
  amount: number;
  dueDate: string;
  description: string;
  status: 'pending' | 'due' | 'paid';
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
  order: number;
  visible: boolean;
}

export interface Client {
  id: string;
  name: string;
  organization: string;
  contactPerson: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  gstin: string;
  pan: string;
  taxType: ClientTaxType;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultRate: number;
  unit: string;
  taxRate: number;
  taxType: TaxType;
  hsnSac: string;
  active: boolean;
  notes: string;
}

export interface DocumentCalculations {
  subtotal: number;
  itemDiscountTotal: number;
  documentDiscountTotal: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  customTax: number;
  totalTax: number;
  roundOff: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
}

export interface BusinessDocument extends DocumentCalculations {
  id: string;
  type: DocumentType;
  number: string;
  revision: number;
  parentDocumentId?: string;
  clientId: string;
  issueDate: string;
  dueDate?: string;
  validUntil?: string;
  status: DocumentStatus;
  currency: string;
  templateId: string; // default 'modern-purple'
  taxBehavior: TaxBehavior;

  items: LineItem[];

  documentDiscountType: DiscountType;
  documentDiscountValue: number;

  paymentMilestones: Milestone[];
  terms: string;
  notes: string;
  customSections: CustomSection[];

  // Visibility toggles
  showLogo: boolean;
  showBusinessAddress: boolean;
  showGstin: boolean;
  showBankDetails: boolean;
  showUpi: boolean;
  showQr: boolean;
  showSignature: boolean;
  showTerms: boolean;
  showPaymentInstructions: boolean;

  paymentStatus: 'unpaid' | 'partially_paid' | 'paid' | 'overpaid';

  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  clientId: string;
  documentId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  notes: string;
  createdAt: string;
}

export interface DocumentRevision {
  id: string;
  documentId: string;
  revisionNumber: number;
  documentSnapshot: BusinessDocument;
  note: string;
  createdAt: string;
}

export interface BusinessProfile {
  name: string;
  displayName: string;
  tagline: string;
  logo: string; // base64 / dataURL
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pin: string;
  gstin: string;
  pan: string;
  signature: string; // base64 / dataURL
}

export interface PaymentSettings {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  upiId: string;
  upiQr: string; // base64 / dataURL
  paymentInstructions: string;
}

export interface NumberingRule {
  prefix: string;
  yearFormat: 'YYYY' | 'YY-YY' | 'NONE';
  startingNumber: number;
  padding: number;
  separator: string;
  nextNumber: number;
}

export type NumberingSettings = Record<DocumentType, NumberingRule>;

export interface AppSettings {
  currency: string;
  currencySymbol: string;
  dateFormat: string;
  taxInclusiveDefault: boolean;
  onboardingCompleted: boolean;
}

export interface ApplicationBackup {
  application: string;
  schemaVersion: number;
  exportedAt: string;
  data: {
    businessProfile: BusinessProfile;
    paymentSettings: PaymentSettings;
    numberingSettings: NumberingSettings;
    appSettings: AppSettings;
    clients: Client[];
    services: Service[];
    documents: BusinessDocument[];
    payments: Payment[];
    revisions: DocumentRevision[];
  };
}
