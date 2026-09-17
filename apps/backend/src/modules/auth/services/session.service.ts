import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../entities/session.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  /**
   * Create new session
   * @param sessionData - Session data
   * @returns Created session
   */
  async create(sessionData: {
    userId: string;
    ipAddress?: string;
    userAgent?: string;
    refreshToken: string;
    expiresAt: Date;
  }): Promise<Session> {
    const session = this.sessionRepository.create({
      ...sessionData,
      lastActive: new Date(),
    });

    return this.sessionRepository.save(session);
  }

  /**
   * Find sessions by user ID
   * @param userId - User ID
   * @returns Array of sessions
   */
  async findByUserId(userId: string): Promise<Session[]> {
    return this.sessionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find session by refresh token
   * @param refreshToken - Refresh token
   * @returns Session or undefined
   */
  async findByRefreshToken(refreshToken: string): Promise<Session | null> {
    return this.sessionRepository.findOne({
      where: { refreshToken },
    });
  }

  /**
   * Delete session by ID
   * @param sessionId - Session ID
   */
  async delete(sessionId: string): Promise<void> {
    await this.sessionRepository.delete(sessionId);
  }

  /**
   * Delete all sessions for a user
   * @param userId - User ID
   */
  async deleteAllByUserId(userId: string): Promise<void> {
    await this.sessionRepository.delete({ userId });
  }

  /**
   * Delete session by refresh token
   * @param refreshToken - Refresh token
   */
  async deleteByRefreshToken(refreshToken: string): Promise<void> {
    await this.sessionRepository.delete({ refreshToken });
  }

  /**
   * Update last active timestamp
   * @param sessionId - Session ID
   */
  async updateLastActive(sessionId: string): Promise<void> {
    await this.sessionRepository.update(sessionId, {
      lastActive: new Date(),
    });
  }
}
