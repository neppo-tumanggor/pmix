import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, EntityManager } from 'typeorm';
import { ISettingsRepository } from '../interfaces/settings.repository.interface';
import { Settings } from '../entities/settings.entity';

@Injectable()
export class SettingsRepository implements ISettingsRepository {
  constructor(
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>,
  ) {}

  async findByTenantCategoryAndKey(
    tenantId: string,
    category: string,
    key: string,
  ): Promise<Settings | null> {
    return this.settingsRepository.findOne({
      where: {
        tenantId,
        category,
        key,
        deletedAt: null,
      },
    });
  }

  async findByTenantAndCategory(
    tenantId: string,
    category: string,
  ): Promise<Settings[]> {
    return this.settingsRepository.find({
      where: {
        tenantId,
        category,
        deletedAt: null,
      },
      order: {
        key: 'ASC',
      },
    });
  }

  async findCategoriesByTenant(tenantId: string): Promise<string[]> {
    const results = await this.settingsRepository
      .createQueryBuilder('settings')
      .select('DISTINCT settings.category', 'category')
      .where('settings.tenant_id = :tenantId', { tenantId })
      .andWhere('settings.deleted_at IS NULL')
      .orderBy('settings.category', 'ASC')
      .getRawMany();

    return results.map((result) => result.category);
  }

  async create(settings: Partial<Settings>): Promise<Settings> {
    const newSettings = this.settingsRepository.create(settings);
    return this.settingsRepository.save(newSettings);
  }

  async createInTransaction(
    manager: EntityManager,
    settings: Partial<Settings>,
  ): Promise<Settings> {
    const newSettings = manager.create(Settings, settings);
    return manager.save(newSettings);
  }

  async update(settings: Partial<Settings> & { id: string }): Promise<Settings> {
    const { id, ...updateData } = settings;
    await this.settingsRepository.update(id, updateData);
    return this.settingsRepository.findOne({
      where: { id },
    }) as Promise<Settings>;
  }

  async updateInTransaction(
    manager: EntityManager,
    id: string,
    updateData: Partial<Settings>,
  ): Promise<Settings> {
    await manager.update(Settings, id, updateData);
    return manager.findOne(Settings, {
      where: { id },
    }) as Promise<Settings>;
  }

  async softDelete(id: string): Promise<void> {
    await this.settingsRepository.softDelete(id);
  }

  async exists(tenantId: string, category: string, key: string): Promise<boolean> {
    const count = await this.settingsRepository.count({
      where: {
        tenantId,
        category,
        key,
        deletedAt: null,
      },
    });
    return count > 0;
  }

  async findById(id: string): Promise<Settings | null> {
    return this.settingsRepository.findOne({
      where: {
        id,
        deletedAt: null,
      },
    });
  }
}
