import { Settings } from '../entities/settings.entity';
import { EntityManager } from 'typeorm';

export interface ISettingsRepository {
  findByTenantCategoryAndKey(
    tenantId: string,
    category: string,
    key: string,
  ): Promise<Settings | null>;
  
  findByTenantAndCategory(
    tenantId: string,
    category: string,
  ): Promise<Settings[]>;
  
  findCategoriesByTenant(tenantId: string): Promise<string[]>;
  
  create(settings: Partial<Settings>): Promise<Settings>;
  
  createInTransaction(
    manager: EntityManager,
    settings: Partial<Settings>,
  ): Promise<Settings>;
  
  update(settings: Partial<Settings> & { id: string }): Promise<Settings>;
  
  updateInTransaction(
    manager: EntityManager,
    id: string,
    updateData: Partial<Settings>,
  ): Promise<Settings>;
  
  softDelete(id: string): Promise<void>;
  
  exists(tenantId: string, category: string, key: string): Promise<boolean>;
  
  findById(id: string): Promise<Settings | null>;
}
