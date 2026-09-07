import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { AUTH_CONFIG } from '../constants/auth.config';
import { AuthErrorCodes } from '../constants/error-codes.enum';

@Injectable()
export class AccountLockoutService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Record failed login attempt
   * @param userId - User ID
   */
  async recordFailedAttempt(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return;

    user.failedLoginAttempts += 1;

    // Lock account if max attempts reached
    if (user.failedLoginAttempts >= AUTH_CONFIG.ACCOUNT_LOCKOUT.MAX_ATTEMPTS) {
      user.lockedUntil = new Date(Date.now() + AUTH_CONFIG.ACCOUNT_LOCKOUT.LOCKOUT_DURATION);
    }

    await this.userRepository.save(user);
  }

  /**
   * Reset failed login attempts
   * @param userId - User ID
   */
  async resetFailedAttempts(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      failedLoginAttempts: 0,
      lockedUntil: null,
    });
  }

  /**
   * Check if account is locked
   * @param user - User object
   * @returns True if account is locked
   */
  isLocked(user: User): boolean {
    if (!user.lockedUntil) return false;
    
    const now = new Date();
    if (now < user.lockedUntil) {
      return true;
    }

    // Lockout expired, reset it
    this.resetFailedAttempts(user.id);
    return false;
  }

  /**
   * Verify if account can login, throw exception if locked
   * @param user - User object
   * @throws ForbiddenException if account is locked
   */
  verifyNotLocked(user: User): void {
    if (this.isLocked(user)) {
      throw new ForbiddenException({
        message: 'Account locked. Try again later.',
        error: AuthErrorCodes.ACCOUNT_LOCKED,
        lockedUntil: user.lockedUntil,
      });
    }
  }
}
