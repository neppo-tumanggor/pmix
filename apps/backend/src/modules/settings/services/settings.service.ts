import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Settings, SettingCategory } from '../entities/settings.entity';
import { AuditLog, AuditAction } from '../entities/audit-log.entity';
import { SettingsRepository } from '../repositories/settings.repository';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import { EncryptionService } from './encryption.service';
import { CacheService } from './cache.service';
import { EntityManager } from 'typeorm';

@Injectable()
export class SettingsService {
  constructor(
    private readonly settingsRepository: SettingsRepository,
    private readonly auditLogRepository: AuditLogRepository,
    private readonly encryptionService: EncryptionService,
    private readonly cacheService: CacheService,
    private readonly dataSource: DataSource,
  ) {}

  async getByCategory(tenantId: string, category: SettingCategory): Promise<Record<string, any>> {
    const cacheKey = this.cacheService.buildKey(tenantId, category);

    // Try cache first
    const cached = await this.cacheService.get<Record<string, any>>(cacheKey);
    if (cached) {
      return cached;
    }

    // Cache miss - query database
    const settings = await this.settingsRepository.findByTenantAndCategory(
      tenantId,
      category,
    );

    if (settings.length === 0) {
      throw new NotFoundException(`Settings for category "${category}" not found`);
    }

    // Transform to key-value object and decrypt if needed
    const result: Record<string, any> = {};
    for (const setting of settings) {
      if (setting.isEncrypted && setting.value) {
        // Decrypt encrypted values
        try {
          const decrypted = this.encryptionService.decryptObject<Record<string, any>>(
            setting.value as any,
          );
          result[setting.key] = decrypted;
        } catch (error) {
          result[setting.key] = null;
        }
      } else {
        result[setting.key] = setting.value;
      }
    }

    // Cache the result
    await this.cacheService.set(cacheKey, result);

    return result;
  }

  async getByKey(
    tenantId: string,
    category: SettingCategory,
    key: string,
  ): Promise<any> {
    const setting = await this.settingsRepository.findByTenantCategoryAndKey(
      tenantId,
      category,
      key,
    );

    if (!setting) {
      throw new NotFoundException(`Setting "${key}" not found in category "${category}"`);
    }

    if (setting.isEncrypted && setting.value) {
      try {
        return this.encryptionService.decryptObject(setting.value as any);
      } catch (error) {
        return null;
      }
    }

    return setting.value;
  }

  async initializeDefaults(tenantId: string): Promise<number> {
    // Check if already initialized
    const categories = await this.settingsRepository.findCategoriesByTenant(tenantId);
    if (categories.length > 0) {
      throw new ConflictException('Settings already initialized for this tenant');
    }

    const defaults = this.getDefaultSettings();
    let count = 0;

    for (const [category, settings] of Object.entries(defaults)) {
      for (const [key, value] of Object.entries(settings)) {
        await this.settingsRepository.create({
          tenantId,
          category: category as SettingCategory,
          key,
          value: { value },
          isEncrypted: this.shouldEncrypt(key, category as SettingCategory),
        });
        count++;
      }
    }

    return count;
  }

  private shouldEncrypt(key: string, category: SettingCategory): boolean {
    const encryptedKeys: Record<SettingCategory, string[]> = {
      [SettingCategory.GENERAL]: [],
      [SettingCategory.EMAIL]: ['smtp_password', 'api_key'],
      [SettingCategory.SMS]: ['api_key', 'api_secret'],
      [SettingCategory.WHATSAPP]: ['api_token', 'api_secret'],
      [SettingCategory.SECURITY]: ['jwt_secret', 'encryption_key'],
      [SettingCategory.NOTIFICATIONS]: [],
      [SettingCategory.BRANDING]: [],
      [SettingCategory.INTEGRATIONS]: ['api_key', 'api_secret', 'webhook_secret'],
    };

    return encryptedKeys[category]?.includes(key) || false;
  }

  async updateCategory(
    tenantId: string,
    category: SettingCategory,
    data: Record<string, any>,
    userId: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<void> {
    // Use transaction for atomic update
    await this.dataSource.manager.transaction(async (manager: EntityManager) => {
      // Get existing settings for this category
      const existingSettings = await this.settingsRepository.findByTenantAndCategory(
        tenantId,
        category,
      );

      // Update or create each setting
      for (const [key, value] of Object.entries(data)) {
        const existing = existingSettings.find((s) => s.key === key);

        if (existing) {
          // Update existing setting
          const encryptedValue = existing.isEncrypted
            ? this.encryptionService.encryptObject(value)
            : value;

          await this.settingsRepository.updateInTransaction(manager, existing.id, {
            value: encryptedValue,
            updatedAt: new Date(),
          });

          // Log the update
          await this.auditLogRepository.createInTransaction(manager, {
            tenantId,
            action: AuditAction.UPDATE,
            resourceType: 'setting',
            resourceId: existing.id,
            changes: { [key]: { old: existing.value, new: value } },
            userId,
            ipAddress,
            userAgent,
          });
        } else {
          // Create new setting
          const isEncrypted = this.shouldEncrypt(key, category);
          const encryptedValue = isEncrypted
            ? this.encryptionService.encryptObject(value)
            : value;

          const newSetting = await this.settingsRepository.createInTransaction(manager, {
            tenantId,
            category,
            key,
            value: encryptedValue,
            isEncrypted,
          });

          // Log the creation
          await this.auditLogRepository.createInTransaction(manager, {
            tenantId,
            action: AuditAction.CREATE,
            resourceType: 'setting',
            resourceId: newSetting.id,
            changes: { [key]: value },
            userId,
            ipAddress,
            userAgent,
          });
        }
      }

      // Invalidate cache
      const cacheKey = this.cacheService.buildKey(tenantId, category);
      await this.cacheService.invalidate(cacheKey);
    });
  }

  async delete(
    tenantId: string,
    category: SettingCategory,
    key: string,
    userId: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<void> {
    // Find the setting
    const setting = await this.settingsRepository.findByTenantCategoryAndKey(
      tenantId,
      category,
      key,
    );

    if (!setting) {
      throw new NotFoundException(`Setting "${key}" not found in category "${category}"`);
    }

    // Soft delete the setting
    await this.settingsRepository.softDelete(setting.id);

    // Log the deletion
    await this.auditLogRepository.create({
      tenantId,
      action: AuditAction.DELETE,
      resourceType: 'setting',
      resourceId: setting.id,
      changes: { [key]: setting.value },
      userId,
      ipAddress,
      userAgent,
    });

    // Invalidate cache
    const cacheKey = this.cacheService.buildKey(tenantId, category);
    await this.cacheService.invalidate(cacheKey);
  }

  private getDefaultSettings(): Record<string, Record<string, any>> {
    return {
      [SettingCategory.GENERAL]: {
        app_name: 'pmix',
        timezone: 'UTC',
        language: 'en',
      },
      [SettingCategory.EMAIL]: {
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        smtp_secure: false,
        smtp_user: '',
        smtp_password: '',
        from_email: 'noreply@pmix.com',
        from_name: 'pmix',
      },
      [SettingCategory.SECURITY]: {
        password_min_length: 8,
        password_require_uppercase: true,
        password_require_lowercase: true,
        password_require_numbers: true,
        password_require_special_chars: true,
        session_timeout_minutes: 60,
        max_login_attempts: 5,
        lockout_duration_minutes: 15,
      },
      [SettingCategory.NOTIFICATIONS]: {
        email_enabled: true,
        sms_enabled: false,
        push_enabled: true,
      },
    };
  }
}
