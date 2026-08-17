import { db } from '../database/db';
import type { Service } from '../../types';

export const ServiceRepository = {
  async getAll(): Promise<Service[]> {
    return await db.services.orderBy('name').toArray();
  },

  async getById(id: string): Promise<Service | undefined> {
    return await db.services.get(id);
  },

  async create(service: Omit<Service, 'id'>): Promise<Service> {
    const newService: Service = {
      ...service,
      id: 'srv_' + crypto.randomUUID()
    };
    await db.services.add(newService);
    return newService;
  },

  async update(id: string, updates: Partial<Service>): Promise<Service> {
    const existing = await db.services.get(id);
    if (!existing) throw new Error('Service not found');
    const updated: Service = {
      ...existing,
      ...updates
    };
    await db.services.put(updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    await db.services.delete(id);
  },

  async getCategories(): Promise<string[]> {
    const services = await this.getAll();
    const categories = new Set<string>();
    services.forEach(s => {
      if (s.category) categories.add(s.category);
    });
    return Array.from(categories).sort();
  }
};
