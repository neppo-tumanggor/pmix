import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { PasswordHistory } from '../entities/password-history.entity';
import { AUTH_CONFIG } from '../constants/auth.config';
import { AuthErrorCodes } from '../constants/error-codes.enum';

@Injectable()
export class PasswordService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PasswordHistory)
    private readonly passwordHistoryRepository: Repository<PasswordHistory>,
  ) {}

  /**
   * Hash password using bcrypt
   * @param password - Plain text password
   * @returns Hashed password
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, AUTH_CONFIG.BCRYPT_ROUNDS);
  }

  /**
   * Verify password against hash
   * @param password - Plain text password
   * @param hash - Hashed password
   * @returns True if password matches
   */
  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Validate password strength
   * @param password - Password to validate
   * @throws BadRequestException if password is weak
   */
  async validateStrength(password: string): Promise<void> {
    const errors: string[] = [];

    if (password.length < AUTH_CONFIG.PASSWORD.MIN_LENGTH) {
      errors.push(`Password must be at least ${AUTH_CONFIG.PASSWORD.MIN_LENGTH} characters`);
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: errors.join(', '),
        error: AuthErrorCodes.WEAK_PASSWORD,
      });
    }
  }

  /**
   * Check if password was used before (password history)
   * @param userId - User ID
   * @param password - Password to check
   * @returns True if password was used before
   */
  async isPasswordUsed(userId: string, password: string): Promise<boolean> {
    const passwordHistory = await this.passwordHistoryRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: AUTH_CONFIG.PASSWORD.HISTORY_SIZE,
    });

    for (const history of passwordHistory) {
      const isMatch = await bcrypt.compare(password, history.passwordHash);
      if (isMatch) {
        return true;
      }
    }

    return false;
  }

  /**
   * Save password to history
   * @param userId - User ID
   * @param passwordHash - Hashed password to save
   */
  async saveToHistory(userId: string, passwordHash: string): Promise<void> {
    const history = this.passwordHistoryRepository.create({
      userId,
      passwordHash,
    });

    await this.passwordHistoryRepository.save(history);

    // Clean up old history (keep only last N passwords)
    const allHistory = await this.passwordHistoryRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: AUTH_CONFIG.PASSWORD.HISTORY_SIZE,
    });

    if (allHistory.length > 0) {
      await this.passwordHistoryRepository.remove(allHistory);
    }
  }
}
