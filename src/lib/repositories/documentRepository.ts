import { db } from '../database/db';
import type { BusinessDocument, DocumentType } from '../../types';
import { SettingsRepository } from './settingsRepository';
import { calculateDocument } from '../calculations/calculationEngine';
import { ClientRepository } from './clientRepository';
import { RevisionRepository } from './revisionRepository';

export const DocumentRepository = {
  async getAll(): Promise<BusinessDocument[]> {
    return await db.documents.orderBy('createdAt').reverse().toArray();
  },

  async getByType(type: DocumentType): Promise<BusinessDocument[]> {
    return await db.documents
      .where('type')
      .equals(type)
      .reverse()
      .sortBy('createdAt');
  },

  async getByClientId(clientId: string): Promise<BusinessDocument[]> {
    return await db.documents
      .where('clientId')
      .equals(clientId)
      .reverse()
      .sortBy('createdAt');
  },

  async getById(id: string): Promise<BusinessDocument | undefined> {
    return await db.documents.get(id);
  },

  async create(docData: Omit<BusinessDocument, 'id' | 'number' | 'revision' | 'createdAt' | 'updatedAt' | 'subtotal' | 'itemDiscountTotal' | 'documentDiscountTotal' | 'taxableAmount' | 'cgst' | 'sgst' | 'igst' | 'customTax' | 'totalTax' | 'roundOff' | 'grandTotal' | 'amountPaid' | 'balanceDue'>): Promise<BusinessDocument> {
    const docNumber = await SettingsRepository.generateNextDocumentNumber(docData.type);
    const client = docData.clientId ? await ClientRepository.getById(docData.clientId) : undefined;
    const clientTaxType = client ? client.taxType : 'GST_INTRA';

    const calculations = calculateDocument(docData, clientTaxType);
    const now = new Date().toISOString();

    const newDoc: BusinessDocument = {
      ...docData,
      ...calculations,
      id: 'doc_' + crypto.randomUUID(),
      number: docNumber,
      revision: 1,
      templateId: docData.templateId || 'modern-purple',
      createdAt: now,
      updatedAt: now
    };

    await db.documents.add(newDoc);
    await RevisionRepository.createRevision(newDoc, 'Initial document creation');
    return newDoc;
  },

  async update(id: string, updates: Partial<BusinessDocument>, revisionNote?: string): Promise<BusinessDocument> {
    const existing = await db.documents.get(id);
    if (!existing) throw new Error('Document not found');

    const merged = { ...existing, ...updates };
    const client = merged.clientId ? await ClientRepository.getById(merged.clientId) : undefined;
    const clientTaxType = client ? client.taxType : 'GST_INTRA';

    const calculations = calculateDocument(merged, clientTaxType);
    const isMajorChange = updates.items || updates.documentDiscountValue || updates.taxBehavior;
    const newRevision = isMajorChange ? existing.revision + 1 : existing.revision;

    const updatedDoc: BusinessDocument = {
      ...merged,
      ...calculations,
      revision: newRevision,
      updatedAt: new Date().toISOString()
    };

    await db.documents.put(updatedDoc);

    if (isMajorChange) {
      await RevisionRepository.createRevision(updatedDoc, revisionNote || 'Updated line items or calculations');
    }

    return updatedDoc;
  },

  async duplicate(id: string): Promise<BusinessDocument> {
    const existing = await db.documents.get(id);
    if (!existing) throw new Error('Document not found');

    const newDocNumber = await SettingsRepository.generateNextDocumentNumber(existing.type);
    const now = new Date().toISOString();

    const duplicated: BusinessDocument = {
      ...existing,
      id: 'doc_' + crypto.randomUUID(),
      number: newDocNumber,
      revision: 1,
      status: 'draft',
      amountPaid: 0,
      balanceDue: existing.grandTotal,
      paymentStatus: 'unpaid',
      createdAt: now,
      updatedAt: now
    };

    await db.documents.add(duplicated);
    await RevisionRepository.createRevision(duplicated, `Duplicated from ${existing.number}`);
    return duplicated;
  },

  async convert(id: string, targetType: DocumentType): Promise<BusinessDocument> {
    const existing = await db.documents.get(id);
    if (!existing) throw new Error('Document not found');

    const newDocNumber = await SettingsRepository.generateNextDocumentNumber(targetType);
    const now = new Date().toISOString();

    const converted: BusinessDocument = {
      ...existing,
      id: 'doc_' + crypto.randomUUID(),
      type: targetType,
      number: newDocNumber,
      revision: 1,
      parentDocumentId: existing.id,
      status: targetType === 'invoice' ? 'issued' : 'draft',
      amountPaid: 0,
      balanceDue: existing.grandTotal,
      paymentStatus: 'unpaid',
      createdAt: now,
      updatedAt: now
    };

    await db.documents.add(converted);

    // Mark original document as converted if it was a quotation
    if (existing.type === 'quotation') {
      await this.update(existing.id, { status: 'converted' }, `Converted to ${newDocNumber}`);
    }

    await RevisionRepository.createRevision(converted, `Converted from ${existing.number}`);
    return converted;
  },

  async recalculatePayments(documentId: string): Promise<void> {
    const doc = await db.documents.get(documentId);
    if (!doc) return;

    const payments = await db.payments.where('documentId').equals(documentId).toArray();
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    const balanceDue = Math.max(0, doc.grandTotal - totalPaid);
    let paymentStatus: 'unpaid' | 'partially_paid' | 'paid' | 'overpaid' = 'unpaid';

    if (totalPaid <= 0) {
      paymentStatus = 'unpaid';
    } else if (totalPaid < doc.grandTotal) {
      paymentStatus = 'partially_paid';
    } else if (totalPaid === doc.grandTotal) {
      paymentStatus = 'paid';
    } else {
      paymentStatus = 'overpaid';
    }

    let status = doc.status;
    if (doc.type === 'invoice') {
      if (paymentStatus === 'paid') status = 'paid';
      else if (paymentStatus === 'partially_paid') status = 'partially_paid';
    }

    await db.documents.update(documentId, {
      amountPaid: totalPaid,
      balanceDue,
      paymentStatus,
      status,
      updatedAt: new Date().toISOString()
    });
  },

  async delete(id: string): Promise<void> {
    await db.documents.delete(id);
    // Clean up payments and revisions
    await db.payments.where('documentId').equals(id).delete();
    await db.revisions.where('documentId').equals(id).delete();
  }
};
