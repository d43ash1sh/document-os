import { db } from '../database/db';
import { SettingsRepository } from '../repositories/settingsRepository';
import type { ApplicationBackup } from '../../types';

export const BackupEngine = {
  async exportBackup(): Promise<ApplicationBackup> {
    const businessProfile = await SettingsRepository.getBusinessProfile();
    const paymentSettings = await SettingsRepository.getPaymentSettings();
    const numberingSettings = await SettingsRepository.getNumberingSettings();
    const appSettings = await SettingsRepository.getAppSettings();

    const clients = await db.clients.toArray();
    const services = await db.services.toArray();
    const documents = await db.documents.toArray();
    const payments = await db.payments.toArray();
    const revisions = await db.revisions.toArray();

    return {
      application: 'Business Document OS',
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      data: {
        businessProfile,
        paymentSettings,
        numberingSettings,
        appSettings,
        clients,
        services,
        documents,
        payments,
        revisions
      }
    };
  },

  async downloadBackupFile(): Promise<void> {
    const backup = await this.exportBackup();
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const dateStr = new Date().toISOString().split('T')[0];
    const link = document.createElement('a');
    link.href = url;
    link.download = `quotation-system-backup-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  validateBackupFile(json: any): { valid: boolean; error?: string; stats?: { clients: number; documents: number; payments: number; services: number } } {
    if (!json || typeof json !== 'object') {
      return { valid: false, error: 'Invalid file format. File is not a valid JSON object.' };
    }

    if (json.application !== 'Business Document OS') {
      return { valid: false, error: 'Unrecognized application signature in backup file.' };
    }

    if (!json.data || typeof json.data !== 'object') {
      return { valid: false, error: 'Backup data payload is missing or corrupted.' };
    }

    const { clients, documents, payments, services } = json.data;

    return {
      valid: true,
      stats: {
        clients: Array.isArray(clients) ? clients.length : 0,
        services: Array.isArray(services) ? services.length : 0,
        documents: Array.isArray(documents) ? documents.length : 0,
        payments: Array.isArray(payments) ? payments.length : 0
      }
    };
  },

  async restoreBackup(backup: ApplicationBackup): Promise<void> {
    await db.transaction('rw', [db.clients, db.services, db.documents, db.payments, db.revisions, db.settings], async () => {
      // Clear existing tables
      await db.clients.clear();
      await db.services.clear();
      await db.documents.clear();
      await db.payments.clear();
      await db.revisions.clear();
      await db.settings.clear();

      // Restore data
      const d = backup.data;
      if (d.clients?.length) await db.clients.bulkAdd(d.clients);
      if (d.services?.length) await db.services.bulkAdd(d.services);
      if (d.documents?.length) await db.documents.bulkAdd(d.documents);
      if (d.payments?.length) await db.payments.bulkAdd(d.payments);
      if (d.revisions?.length) await db.revisions.bulkAdd(d.revisions);

      if (d.businessProfile) await SettingsRepository.saveBusinessProfile(d.businessProfile);
      if (d.paymentSettings) await SettingsRepository.savePaymentSettings(d.paymentSettings);
      if (d.numberingSettings) await SettingsRepository.saveNumberingSettings(d.numberingSettings);
      if (d.appSettings) await SettingsRepository.saveAppSettings(d.appSettings);
    });
  }
};
