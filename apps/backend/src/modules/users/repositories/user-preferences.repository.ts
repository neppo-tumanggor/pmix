import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserPreferencesRepository } from '../interfaces/user-preferences.repository.interface';
import { UserPreferences } from '../entities/user-preferences.entity';

@Injectable()
export class UserPreferencesRepository implements IUserPreferencesRepository {
  constructor(
    @InjectRepository(UserPreferences)
    private readonly preferencesRepository: Repository<UserPreferences>,
  ) {}

  async findByUserId(userId: string): Promise<UserPreferences | null> {
    return this.preferencesRepository.findOne({ where: { userId } });
  }

  async createOrUpdate(
    userId: string,
    tenantId: string,
    data: Partial<UserPreferences>,
  ): Promise<UserPreferences> {
    let preferences = await this.findByUserId(userId);

    if (!preferences) {
      preferences = this.preferencesRepository.create({
        userId,
        tenantId,
        ...data,
      });
    } else {
      preferences = { ...preferences, ...data };
    }

    return this.preferencesRepository.save(preferences);
  }
}
