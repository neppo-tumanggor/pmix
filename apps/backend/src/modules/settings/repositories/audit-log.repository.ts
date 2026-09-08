import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { IAuditLogRepository } from '../interfaces/audit-log.repository.interface';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuditLogRepository implements IAuditLogRepository {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(auditLog: Partial<AuditLog>): Promise<AuditLog> {
    const newAuditLog = this.auditLogRepository.create(auditLog);
    return this.auditLogRepository.save(newAuditLog);
  }

  async createInTransaction(
    manager: EntityManager,
    auditLog: Partial<AuditLog>,
  ): Promise<AuditLog> {
    const newAuditLog = manager.create(AuditLog, auditLog);
    return manager.save(newAuditLog);
  }

  async findByTenantId(tenantId: string, limit = 100): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: {
        tenantId,
      },
      order: {
        timestamp: 'DESC',
      },
      take: limit,
    });
  }

  async findByResource(
    tenantId: string,
    resourceType: string,
    resourceId: string,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: {
        tenantId,
        resourceType,
        resourceId,
      },
      order: {
        timestamp: 'DESC',
      },
    });
  }

  async findByDateRange(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: {
        tenantId,
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        } as any,
      },
      order: {
        timestamp: 'DESC',
      },
    });
  }
}
