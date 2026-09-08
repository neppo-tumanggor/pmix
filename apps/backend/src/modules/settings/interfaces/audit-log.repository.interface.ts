import { AuditLog } from '../entities/audit-log.entity';
import { EntityManager } from 'typeorm';

export interface IAuditLogRepository {
  create(auditLog: Partial<AuditLog>): Promise<AuditLog>;
  
  createInTransaction(
    manager: EntityManager,
    auditLog: Partial<AuditLog>,
  ): Promise<AuditLog>;
  
  findByTenantId(tenantId: string, limit?: number): Promise<AuditLog[]>;
  
  findByResource(
    tenantId: string,
    resourceType: string,
    resourceId: string,
  ): Promise<AuditLog[]>;
  
  findByDateRange(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AuditLog[]>;
}
