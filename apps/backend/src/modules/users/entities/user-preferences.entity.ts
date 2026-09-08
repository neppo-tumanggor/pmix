import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_preferences')
export class UserPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'tenant_id', type: 'varchar', length: 255 })
  tenantId: string;

  @Column({ name: 'email_notifications', type: 'boolean', default: true })
  emailNotifications: boolean;

  @Column({ name: 'sms_notifications', type: 'boolean', default: false })
  smsNotifications: boolean;

  @Column({ name: 'push_notifications', type: 'boolean', default: true })
  pushNotifications: boolean;

  @Column({ name: 'marketing_emails', type: 'boolean', default: false })
  marketingEmails: boolean;

  @Column({ name: 'dashboard_layout', type: 'jsonb', default: '{}' })
  dashboardLayout: Record<string, any>;

  @Column({ name: 'sidebar_collapsed', type: 'boolean', default: false })
  sidebarCollapsed: boolean;

  @Column({ name: 'preferred_language', type: 'varchar', length: 10, default: 'en' })
  preferredLanguage: string;

  @Column({ name: 'preferred_timezone', type: 'varchar', length: 50, default: 'UTC' })
  preferredTimezone: string;

  @Column({ name: 'profile_public', type: 'boolean', default: false })
  profilePublic: boolean;

  @Column({ name: 'show_email', type: 'boolean', default: false })
  showEmail: boolean;

  @Column({ name: 'show_phone', type: 'boolean', default: false })
  showPhone: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
