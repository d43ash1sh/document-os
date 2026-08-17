import { db } from '../database/db';
import type { Client } from '../../types';

export const ClientRepository = {
  async getAll(): Promise<Client[]> {
    return await db.clients.orderBy('name').toArray();
  },

  async getById(id: string): Promise<Client | undefined> {
    return await db.clients.get(id);
  },

  async create(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const now = new Date().toISOString();
    const newClient: Client = {
      ...client,
      id: 'cli_' + crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    };
    await db.clients.add(newClient);
    return newClient;
  },

  async update(id: string, updates: Partial<Client>): Promise<Client> {
    const existing = await db.clients.get(id);
    if (!existing) throw new Error('Client not found');
    const updated: Client = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await db.clients.put(updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    await db.clients.delete(id);
  },

  async search(query: string): Promise<Client[]> {
    const q = query.toLowerCase().trim();
    if (!q) return await this.getAll();
    return await db.clients
      .filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.organization.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
      )
      .toArray();
  }
};
