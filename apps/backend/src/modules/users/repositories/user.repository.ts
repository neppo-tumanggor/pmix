import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../interfaces/user.repository.interface';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByTenant(tenantId: string): Promise<User[]> {
    return this.userRepository.find({ where: { tenantId } });
  }

  async search(query: string, tenantId: string, filters?: any): Promise<User[]> {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .where('user.tenantId = :tenantId', { tenantId })
      .andWhere('user.deletedAt IS NULL');

    if (query) {
      qb.andWhere('(user.name ILIKE :query OR user.email ILIKE :query)', {
        query: `%${query}%`,
      });
    }

    if (filters?.role) {
      qb.andWhere('user.role = :role', { role: filters.role });
    }

    if (filters?.status) {
      qb.andWhere('user.status = :status', { status: filters.status });
    }

    if (filters?.email_verified !== undefined) {
      qb.andWhere('user.emailVerified = :emailVerified', {
        emailVerified: filters.email_verified,
      });
    }

    if (filters?.created_after) {
      qb.andWhere('user.createdAt >= :createdAfter', {
        createdAfter: filters.created_after,
      });
    }

    if (filters?.created_before) {
      qb.andWhere('user.createdAt <= :createdBefore', {
        createdBefore: filters.created_before,
      });
    }

    const sortField = filters?.sort || 'createdAt';
    const sortOrder = filters?.order === 'asc' ? 'ASC' : 'DESC';
    qb.orderBy(`user.${sortField}`, sortOrder);

    if (filters?.limit) {
      qb.limit(filters.limit);
    }

    if (filters?.offset) {
      qb.offset(filters.offset);
    }

    return qb.getMany();
  }

  async updateStatus(userId: string, status: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    user.status = status as any;
    return this.userRepository.save(user);
  }

  async bulkUpdateStatus(userIds: string[], status: string): Promise<number> {
    const result = await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ status: status as any })
      .where('id IN (:...userIds)', { userIds })
      .execute();
    return result.affected || 0;
  }

  findOne(options: any): Promise<User | null> {
    return this.userRepository.findOne(options);
  }

  save(user: Partial<User>): Promise<User> {
    return this.userRepository.save(user);
  }

  async softDelete(id: string): Promise<void> {
    await this.userRepository.softDelete(id);
  }
}
