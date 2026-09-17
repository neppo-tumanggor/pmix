import { Repository } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export interface IUserRepository extends Repository<User> {
  findByEmail(email: string): Promise<User | null>;
  findByTenant(tenantId: string): Promise<User[]>;
  search(query: string, tenantId: string, filters?: any): Promise<User[]>;
  updateStatus(userId: string, status: string): Promise<User>;
  bulkUpdateStatus(userIds: string[], status: string): Promise<number>;
}
