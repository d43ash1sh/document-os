import { db } from '../database/db';
import type { Payment } from '../../types';
import { DocumentRepository } from './documentRepository';

export const PaymentRepository = {
  async getAll(): Promise<Payment[]> {
    return await db.payments.orderBy('paymentDate').reverse().toArray();
  },

  async getByDocumentId(documentId: string): Promise<Payment[]> {
    return await db.payments.where('documentId').equals(documentId).toArray();
  },

  async getByClientId(clientId: string): Promise<Payment[]> {
    return await db.payments.where('clientId').equals(clientId).toArray();
  },

  async recordPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const newPayment: Payment = {
      ...payment,
      id: 'pay_' + crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };

    await db.payments.add(newPayment);

    // Recalculate document payments & balance
    await DocumentRepository.recalculatePayments(payment.documentId);

    return newPayment;
  },

  async delete(id: string): Promise<void> {
    const payment = await db.payments.get(id);
    if (payment) {
      await db.payments.delete(id);
      await DocumentRepository.recalculatePayments(payment.documentId);
    }
  }
};
