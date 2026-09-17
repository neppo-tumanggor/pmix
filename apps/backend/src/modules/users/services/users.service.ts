import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { User } from '../../auth/entities/user.entity';
import { UserPreferences } from '../entities/user-preferences.entity';
import { UserRepository } from '../repositories/user.repository';
import { UserPreferencesRepository } from '../repositories/user-preferences.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly preferencesRepository: UserPreferencesRepository,
  ) {}

  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove sensitive fields
    const { password, emailVerificationToken, passwordResetToken, ...profile } = user;
    return profile;
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being changed
    if (data.email && data.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email already exists');
      }
      user.email = data.email;
      user.emailVerified = false;
    }

    // Update allowed fields
    const allowedFields = [
      'name', 'email', 'bio', 'phone', 'date_of_birth', 'gender',
      'address', 'city', 'country', 'timezone', 'language', 'theme', 'avatar_url'
    ];

    allowedFields.forEach(field => {
      if ((data as any)[field] !== undefined) {
        (user as any)[field] = (data as any)[field];
      }
    });

    const updatedUser = await this.userRepository.save(user);

    // Remove sensitive fields
    const { password, emailVerificationToken, passwordResetToken, ...profile } = updatedUser;
    return profile;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Implementation would involve Auth service
    // For now, just a placeholder
    throw new BadRequestException('Password change not implemented yet');
  }

  async updateStatus(userId: string, status: string, reason?: string): Promise<User> {
    const validStatuses = ['active', 'inactive', 'suspended'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid status');
    }
    return this.userRepository.updateStatus(userId, status);
  }

  async softDelete(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.softDelete(userId);
  }
}
