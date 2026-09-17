import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { ISettingsRepository } from '../interfaces/settings.repository.interface';
import { Settings, SettingCategory } from '../entities/settings.entity';

@Injectable()
export class SettingsRepository implements ISettingsRepository {
  constructor(
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>,
  ) {}

  async findByTenantCategoryAndKey(
    tenantId: string,
    category: SettingCategory,
    key: string,
  ): Promise<Settings | null> {
    return this.settingsRepository.findOne({
      where: {
        tenantId,
        category,
        key,
        deletedAt: null as any,
      },
    });
  }

  async findByTenantAndCategory(
    tenantId: string,
    category: SettingCategory,
  ): Promise<Settings[]> {
    return this.settingsRepository.find({
      where: {
        tenantId,
        category,
        deletedAt: null as any,
      },
    });
  }

  async findCategoriesByTenant(tenantId: string): Promise<string[]> {
    const results = await this.settingsRepository
      .createQueryBuilder('settings')
      .select('DISTINCT settings.category', 'category')
      .where('settings.tenantId = :tenantId', { tenantId })
      .andWhere('settings.deletedAt IS NULL')
      .getRawMany();
    
    return results.map((r) => r.category);
  }

  async create(settings: Partial<Settings>): Promise<Settings> {
    const newSetting = this.settingsRepository.create(settings);
    return this.settingsRepository.save(newSetting);
  }

  async createInTransaction(
    manager: EntityManager,
    settings: Partial<Settings>,
  ): Promise<Settings> {
    const newSetting = manager.create(Settings, settings);
    return manager.save(newSetting);
  }

  async update(
    settings: Partial<Settings> & { id: string },
  ): Promise<Settings> {
    const { id, ...updateData } = settings;
    await this.settingsRepository.update(id, updateData);
    return this.settingsRepository.findOne({ where: { id } }) as Promise<Settings>;
  }

  async updateInTransaction(
    manager: EntityManager,
    id: string,
    updateData: Partial<Settings>,
  ): Promise<Settings> {
    await manager.update(Settings, id, updateData);
    return manager.findOne(Settings, { where: { id } }) as Promise<Settings>;
  }

  async softDelete(id: string): Promise<void> {
    await this.settingsRepository.softDelete(id);
  }

  async exists(
    tenantId: string,
    category: SettingCategory,
    key: string,
  ): Promise<boolean> {
    const count = await this.settingsRepository.count({
      where: {
        tenantId,
        category,
        key,
        deletedAt: null as any,
      },
    });
    return count > 0;
  }

  async findById(id: string): Promise<Settings | null> {
    return this.settingsRepository.findOne({
      where: { id },
    });
  }
}

