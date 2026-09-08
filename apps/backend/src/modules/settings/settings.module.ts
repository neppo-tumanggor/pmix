import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsController } from './controllers/settings.controller';
import { SettingsService } from './services/settings.service';
import { EncryptionService } from './services/encryption.service';
import { CacheService } from './services/cache.service';
import { Settings } from './entities/settings.entity';
import { AuditLog } from './entities/audit-log.entity';
import { SettingsRepository } from './repositories/settings.repository';
import { AuditLogRepository } from './repositories/audit-log.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Settings, AuditLog])],
  controllers: [SettingsController],
  providers: [
    SettingsService,
    EncryptionService,
    CacheService,
    SettingsRepository,
    AuditLogRepository,
  ],
  exports: [SettingsService, EncryptionService],
})
export class SettingsModule {}
