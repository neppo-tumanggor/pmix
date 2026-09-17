import { Injectable, NotFoundException } from '@nestjs/common';
import { UserPreferencesRepository } from '../repositories/user-preferences.repository';
import { UserPreferences } from '../entities/user-preferences.entity';

@Injectable()
export class UserPreferencesService {
  constructor(
    private readonly preferencesRepository: UserPreferencesRepository,
  ) {}

  async getPreferences(userId: string): Promise<UserPreferences> {
    const preferences = await this.preferencesRepository.findByUserId(userId);
    if (!preferences) {
      throw new NotFoundException('User preferences not found');
    }
    return preferences;
  }

  async updatePreferences(
    userId: string,
    tenantId: string,
    data: Partial<UserPreferences>,
  ): Promise<UserPreferences> {
    return this.preferencesRepository.createOrUpdate(userId, tenantId, data);
  }
}
