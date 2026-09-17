import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { TenantEntity } from '../../../common/entities/tenant.entity';

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  READ = 'read',
}

@Entity('audit_logs')
@Index(['tenantId'])
@Index(['timestamp'])
@Index(['resourceType', 'resourceId'])
@Index(['tenantId', 'timestamp'])
export class AuditLog extends TenantEntity {
  @Column({ name: 'user_id', length: 255, nullable: true })
  userId: string;

  @Column({
    name: 'action',
    type: 'varchar',
    length: 50,
  })
  action: AuditAction;

  @Column({
    name: 'resource_type',
    type: 'varchar',
    length: 50,
  })
  resourceType: string;

  @Column({
    name: 'resource_id',
    type: 'varchar',
    length: 255,
  })
  resourceId: string;
  @Column({ name: 'changes', type: 'simple-json', nullable: true })
  changes: Record<string, any>;


  @Column({
    name: 'old_values',
    type: 'simple-json',
    nullable: true,
  })
  oldValues: Record<string, any>;

  @Column({
    name: 'new_values',
    type: 'simple-json',
    nullable: true,
  })
  newValues: Record<string, any>;

  @Column({
    name: 'ip_address',
    type: 'varchar',
    length: 45,
  })
  ipAddress: string;

  @Column({
    name: 'user_agent',
    type: 'text',
  })
  userAgent: string;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;
}
