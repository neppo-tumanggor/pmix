import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { TenantEntity } from '../../../common/entities/tenant.entity';

export enum SettingCategory {
  GENERAL = 'general',
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  SECURITY = 'security',
  NOTIFICATIONS = 'notifications',
  BRANDING = 'branding',
  INTEGRATIONS = 'integrations',
}

@Entity('settings')
@Index(['tenantId', 'category'])
@Index(['tenantId', 'key'])
@Index(['category', 'key'])
@Index(['tenantId', 'category', 'key'], { unique: true })
export class Settings extends TenantEntity {
  @Column({
    name: 'category',
    type: 'varchar',
    length: 50,
  })
  category: SettingCategory;

  @Column({
    name: 'key',
    type: 'varchar',
    length: 100,
  })
  key: string;

  @Column({
    name: 'value',
    type: 'simple-json',
  })
  value: Record<string, any>;

  @Column({
    name: 'is_encrypted',
    type: 'boolean',
    default: false,
  })
  isEncrypted: boolean;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description: string;
}
