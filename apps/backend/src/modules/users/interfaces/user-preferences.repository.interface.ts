import { Repository } from 'typeorm';
import { UserPreferences } from '../entities/user-preferences.entity';

export interface IUserPreferencesRepository extends Repository<UserPreferences> {
  findByUserId(userId: string): Promise<UserPreferences | null>;
  createOrUpdate(userId: string, tenantId: string, data: Partial<UserPreferences>): Promise<UserPreferences>;
}
